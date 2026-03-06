import json
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType   
from libs.queue.queue import app as queue
from libs.payments.payment_helper import verify_tool_access
from libs.schema.vacation_schema import ActivateVacationSchema
from math import ceil
from workers.helpers import get_tool
from workers.tasks.vacation_mode import vacation_mode_deactivate

class VacationModeActions(Actions):
    @jwt_required
    @prepare
    def activate_vacation_mode(self):
        if 'confirmed' not in request.args or request.args['confirmed'] not in ['0', '1']:
            self.abort_json({
                'message':'Preencha o parâmetro de confirmação.',
                'status':'error',
            }, 400)
        else:
            confirmed = True if request.args.get('confirmed','0') == '1' else False

        self.validate(ActivateVacationSchema())

        if self.data['vacation_type'] == 2 and self.data['ends_at'] is None:
            self.abort_json({
                'message':'Para utilizar o Modo Férias com Prazo de Envio dinâmico é necessário informar a data final',
                'status':'error',
            }, 400)

        if self.data['starts_at'] or self.data['ends_at']:
            if self.data['starts_at'] and self.data['starts_at'] < datetime.now():
                self.abort_json({
                    'message':'A data inicial informada já passou',
                    'status':'error',
                }, 400)
            if self.data['ends_at'] and self.data['ends_at'] < datetime.now():
                self.abort_json({
                    'message':'A data final informada já passou',
                    'status':'error',
                }, 400)
            
            starts_at = self.data['starts_at'] if self.data['starts_at'] else datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            if self.data['ends_at'] and (self.data['ends_at'] - starts_at).days <= 0:
                self.abort_json({
                    'message':'O Modo Férias deve ter duração mínima de 1 dia',
                    'status':'error',
                }, 400)
            
        tool = self.get_tool('vacation-apply-tag')
        subscription_required = tool['access_type'] == AccessType.subscription

        condition = " AND ad.status = 'active' "

        if self.data['vacation_type'] == 1 and self.data['pause_full'] is False: # Pausar
            condition += " AND (ad.logistic_type IS NULL OR ad.logistic_type != 'fulfillment') "
        elif self.data['vacation_type'] == 2: # Prazo de envio
            condition += " AND (ad.logistic_type IS NULL OR ad.logistic_type != 'fulfillment') AND NOT (ad.shipping_tags ? 'self_service_in') "

        filter_values, filter_query, filter_total, accounts_id, grouped_count = self.apply_filter(request, additional_conditions=condition, subscription_required=subscription_required, module_id=tool['module_id'])

        if filter_total == 0:
            self.abort_json({
                'message': 'Nenhum anúncio elegível para modo férias',
                'status': 'error',
            }, 400)
        
        if not confirmed:
            accounts_message = ', '.join([f'{key}: {value}' for key,value in grouped_count.items()])
            return self.return_success(f"Total de anúncios que entrarão no modo férias por conta(s): {accounts_message}")
        
        code, message = verify_tool_access(self, self.user['id'], accounts_id, tool, filter_total)

        if code != 200:
            self.abort_json({
                'message': message,
                'status': 'error',
            }, code)

        # expiration = self.fetchone(f"""
        #     SELECT MIN(latest_account_expiration_date) AS earliest_date
        #     FROM (	
        #         SELECT sa.account_id, max(su.expiration_date) as latest_account_expiration_date
        #         FROM meuml.subscriptions su
        #         JOIN meuml.subscription_accounts sa on sa.subscription_id = su.id 
        #         WHERE 
        #             su.user_id = {self.user['id']} AND 
        #             (su.package_id = 2 OR string_to_array(su.modules, ',') @> array['6']) AND 
        #             su.expiration_date > NOW() AND 
        #             sa.account_id IN ({','.join([str(account_id) for account_id in accounts_id])})
        #         GROUP BY sa.account_id 
        #     ) subquery
        # """)
        
        # if self.data['starts_at'] and self.data['starts_at'] > expiration['earliest_date']:
        #     self.abort_json({
        #         'message':f'Não possível realizar o agendamento pois a data inicial informada extrapola o vencimento de sua assinatura ({expiration["earliest_date"].strftime("%H:%M %d/%m/%Y")})',
        #         'status':'error',
        #     }, 402)
        
        # if self.data['ends_at'] and self.data['ends_at'] > expiration['earliest_date']:
        #     self.abort_json({
        #         'message':f'Não possível realizar o agendamento pois a data final informada extrapola o vencimento de sua assinatura ({expiration["earliest_date"].strftime("%H:%M %d/%m/%Y")})',
        #         'status':'error',
        #     }, 402)

        query = """
            SELECT *
            FROM meuml.vacations vc
            WHERE vc.has_finished IS FALSE AND vc.account_id = ANY(:accounts_id)
        """
        if len(self.fetchall(query, {'accounts_id': list(accounts_id)})) > 0:
            self.abort_json({
                'message': 'Ao menos uma das contas selecionadas já se encontram em modo férias!',
                'status': 'error',
            }, 400)

        query = "INSERT INTO meuml.vacations (user_id, vacation_type, tag_name, starts_at, ends_at, account_id) VALUES (:user_id, :vacation_type, :tag_name, :starts_at, :ends_at, :account_id) RETURNING id"
        values = {
            'user_id': self.user['id'], 
            'vacation_type': self.data['vacation_type'],
            'starts_at': self.data['starts_at'], 
            'ends_at': self.data['ends_at'],
        }

        for account_id in accounts_id:
            tag_name = 'FERIAS_'+self.id_generator()
            values['tag_name'] = tag_name
            values['account_id'] = account_id
            vacation_id = self.execute_insert(query, values)
            
            vacation_apply_tag = queue.signature('local_priority:vacation_apply_tag')
            vacation_apply_tag.delay(self.user['id'], filter_query+f' AND ac.id = {account_id} ', filter_values, vacation_id, [account_id], tag_name, self.data['starts_at'])

        return self.return_success(f"Ativar Modo férias - aplicação de tags iniciada. Confira o andamento em Processos", data=self.data)
    

    @jwt_required
    @prepare
    def deactivate_vacation_mode(self, vacation_id):
        vacation = self.fetchone("""
            SELECT vc.* 
            FROM meuml.vacations vc 
            WHERE vc.id = :id 
        """, {'id': vacation_id})

        if vacation is None:
            self.abort_json({
                'message': 'Modo Férias informado não encontrado',
                'status': 'error',
            }, 404)

        if vacation['user_id'] != self.user['id']:
            self.abort_json({
                'message': 'Modo Férias não percence ao usuário',
                'status': 'error',
            }, 403)

        if vacation['has_finished']:
            self.abort_json({
                'message': 'Modo Férias informado já foi finalizado',
                'status': 'error',
            }, 400)
        
        expiration = self.fetchone("""
            SELECT MIN(latest_account_expiration_date) AS earliest_date
            FROM (
                SELECT sa.account_id, max(su.expiration_date) as latest_account_expiration_date
                FROM meuml.subscriptions su
                JOIN meuml.subscription_accounts sa on sa.subscription_id = su.id
                WHERE
                    su.user_id = :user_id AND
                    (su.package_id = 2 OR string_to_array(su.modules, ',') @> array['6']) AND
                    sa.account_id = :account_id
                GROUP BY sa.account_id
            ) subquery
        """, {'user_id': self.user['id'], 'account_id': vacation['account_id']})
        
        if expiration['earliest_date'] is None or expiration['earliest_date'] < datetime.now():
            self.abort_json({
                'message':f'Infelizmente não possível finalizar o Modo Férias manualmente pois a sua assinatura está vencida',
                'status':'error',
            }, 402)

        if vacation['has_started']:
            # vacation_mode_deactivate = queue.signature('local_priority:vacation_mode_deactivate')
            # vacation_mode_deactivate.delay(vacation['user_id'], vacation['id'], vacation['tag_id'])
            if vacation_mode_deactivate(vacation['user_id'], vacation['id'], vacation['tag_id'], self):
                return self.return_success(f"Desativar Modo férias - regularização de anúncios iniciada. Confira o andamento em Processos")
            else:
                self.abort_json({
                    'message': 'Desativar Modo férias - erro ao finalizar modo férias manualmente',
                    'status': 'error',
                }, 500)

        else:
            self.execute("DELETE FROM meuml.vacations WHERE id = :id", {'id': vacation['id']}) 
            if vacation['tag_id']:
                query = """
                    DELETE FROM meuml.tagged_items 
                    WHERE tag_id = :tag_id
                """
                self.execute(query, {'tag_id': vacation['tag_id']})

                query = """
                    DELETE FROM meuml.tags 
                    WHERE id = :tag_id
                """
                self.execute(query, {'tag_id': vacation['tag_id']})
            return self.return_success(f"Desativar Modo férias - agendamento cancelado.")


    @jwt_required
    @prepare
    def list_vacations(self):
        query = """
            SELECT vc.*, string_agg(ac.name ,', ' ORDER BY ac.name ) as accounts 
            FROM meuml.vacations vc 
            JOIN meuml.accounts ac ON ac.id = vc.account_id
            WHERE vc.user_id = :user_id 
            GROUP BY vc.id 
        """
        vacations = self.fetchall(query, {'user_id': self.user['id']})    

        return self.return_success(data=vacations)
