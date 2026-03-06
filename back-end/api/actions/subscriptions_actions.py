import json
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType
from libs.queue.queue import app as queue


class SubscriptionsActions(Actions):
    @jwt_required
    @prepare
    def subscription_details(self):
        query = "SELECT id, name FROM meuml.accounts WHERE user_id = :user_id"
        ml_accounts = self.fetchall(query, {'user_id': self.user['id']})

        query = "SELECT id, name FROM shopee.accounts WHERE user_id = :user_id"
        shopee_accounts = self.fetchall(query, {'user_id': self.user['id']})

        accounts = ml_accounts + shopee_accounts

        query = """
            SELECT mo.id, mo.title
            FROM meuml.modules mo
            JOIN meuml.package_modules pm ON pm.module_id = mo.id
            WHERE pm.package_id = 1
        """
        free_modules = self.fetchall(query)
        free_modules_int_list = [int(module['id']) for module in free_modules]

        query = """
            SELECT su.*, COALESCE(pa.title,'') as package_name, 
                string_agg(COALESCE (ac.name,sc.name), ', ' order by COALESCE(ac.name, sc.name)) as accounts, 
                string_agg(COALESCE(ac.id, sc.id)::varchar, ', ' order by COALESCE(ac.name, sc.name)) as accounts_id 
            FROM meuml.subscriptions su 
            LEFT JOIN meuml.subscription_accounts sa ON sa.subscription_id = su.id 
            LEFT JOIN meuml.accounts ac ON sa.account_id = ac.id
            LEFT JOIN shopee.accounts sc ON sa.account_id = sc.id
            LEFT JOIN meuml.packages pa ON su.package_id = pa.id 
            WHERE su.user_id = :user_id AND su.expiration_date > NOW() 
            GROUP BY su.id, package_name
            ORDER BY date_modified DESC 
        """
        subscriptions = self.fetchall(query, {'user_id': self.user['id']})

        for i, data in enumerate(subscriptions):
            if data['package_id']:
                query = """
                    SELECT mo.id, mo.title
                    FROM meuml.modules mo
                    JOIN meuml.package_modules pm ON pm.module_id = mo.id
                    WHERE pm.package_id = :package_id
                """
                modules = self.fetchall(
                    query, {'package_id': data['package_id']})
                data['modules'] = [int(module['id']) for module in modules]
            else:
                data['package_name'] = 'Personalizado'
                data['modules'] = list(set(
                    [int(module) for module in data['modules'].split(',')] + free_modules_int_list))
                query = """
                    SELECT mo.title
                    FROM meuml.modules mo
                    WHERE mo.id IN (
                """
                values, query_list = self.list_to_dict(
                    data['modules'], 'module')
                modules = self.fetchall(query + query_list, values)

            modules = ', '.join([module['title'] for module in modules])
            data['modules_names'] = modules

            accounts = [account for account in accounts if data['accounts_id'] and str(
                account['id']) not in data['accounts_id']]
            subscriptions[i] = data

        if len(accounts) > 0:
            data = {}
            data['package_name'] = 'Gratuito'
            data['modules'] = free_modules_int_list
            data['modules_names'] = ', '.join(
                [module['title'] for module in free_modules])
            data['accounts'] = ', '.join(
                [account['name'] for account in accounts])
            data['expiration_date'] = 'Ilimitado'
            data['price'] = 0
            subscriptions.append(data)

        return self.return_success("Assinatura", subscriptions)

    @jwt_required
    @prepare
    def subscribe(self):
        if request.method == 'GET':
            query = """
                SELECT  * 
                FROM meuml.account_multiplier
            """
            account_multiplier = self.fetchall(query)

            query = """
                SELECT mo.id, mo.title, mo.price, COALESCE(mo.platform, 'MeuML') as platform
                FROM meuml.modules mo 
                WHERE mo.id NOT IN (11, 13, 14, 15)
                ORDER BY mo.price, mo.title
            """
            modules = self.fetchall(query)

            query = """
                SELECT pa.id, pa.title, pa.price, string_agg(mo.title, ', ' ORDER BY mo.title) AS modules 
                FROM meuml.packages pa 
                JOIN meuml.package_modules pm ON pm.package_id = pa.id 
                JOIN meuml.modules mo ON pm.module_id = mo.id 
                GROUP BY pa.id, pa.title, pa.price 
            """
            packages = self.fetchall(query)

            for package in packages:
                package['modules'] = package['modules'].replace(
                    "Contas", "Multicontas").replace(', Processos', '')

            for i, module in enumerate(modules):
                if module['id'] == 1:
                    module['title'] = "Multicontas"
                    module['tools'] = "Adicione quantas contas quiser, sem limites!"
                elif module['id'] == 2:
                    module['tools'] = "Consulte as Novidades do Mercado Livre para cada uma de suas contas."
                elif module['id'] == 3:
                    module['tools'] = "Consulte os pesos e dimensões permitidos pelo Mercado Envios em cada Categoria do Mercado Livre!"
                elif module['id'] == 5:
                    module['tools'] = "Bloqueie e Desbloqueie compradores para Perguntas e Vendas em múltiplas contas. Adicionais: criação de listas de bloqueio, bloqueio em massa e lista para consultar todos os bloqueados."
                elif module['id'] == 6:
                    module['tools'] = "Listagem com todos seus anúncios, com filtros e ordenações. Adicionais: ações individuais de Aplicar Desconto, aplicar anúncio no Catálogo, Pausar, Ativar, Finalizar, Excluir, alterar Preço.Alterações em massa das Descrições: Substituição de texto, adição de Cabeçalho e Rodapé. Aplicar Desconto em massa, alterar Preço em massa."
                elif module['id'] == 7:
                    module['tools'] = "Acompanhe o posicionamento diário de todos os seus anúncios ativos!"
                elif module['id'] == 8:
                    module['tools'] = "Responda as perguntas de todas as suas contas numa tela única, e também pelo aplicativo mobile!"
                elif module['id'] == 9:
                    module['tools'] = "Listagem com todos seus anúncios, com filtros e ordenações. Adicionais: ações individuais de Aplicar Desconto, aplicar anúncio no Catálogo, Pausar, Ativar, Finalizar, Excluir, alterar Preço."
                elif module['id'] == 10:
                    module['tools'] = "Visualize os detalhes de suas vendas"
                elif module['id'] == 12:
                    module['tools'] = "Aplique alterações de preço em seus anúncios"

            data = {
                'account_multiplier': account_multiplier,
                'packages': packages,
                'modules':  modules
            }

            return self.return_success('Realizar assinatura', data)

        elif request.method == 'POST':
            package_id = None if len(request.form.get('package_id', '')) == 0 or request.form.get(
                'package_id', '') == 'null' else request.form.get('package_id')
            if len(request.form.get('modules_id', '')) == 0 or request.form.get('modules_id', '') == 'null':
                modules_id = None
            else:
                modules_id = request.form.get('modules_id', '').split(',')
                modules_id = list(set([int(module_id)
                                  for module_id in modules_id]))
                modules_id = ','.join([str(module_id)
                                      for module_id in modules_id])
            total_price = float(request.form.get('total_price', 0))

            if total_price == 0:
                return self.return_success(f'Não é possível comprar o Plano Gratuito', code=400)

            query = """
                SELECT su.*, string_agg(sa.account_id::varchar, ',' ORDER BY sa.account_id) as accounts
                FROM meuml.subscriptions su 
                JOIN meuml.subscription_accounts sa ON sa.subscription_id = su.id 
                WHERE su.user_id = :user_id AND su.expiration_date > NOW() 
                GROUP BY su.id
            """
            subscriptions = self.fetchall(query, {'user_id': self.user['id']})
            accounts = request.form.get('accounts_id', '').split(',')
            accounts = ','.join(sorted(accounts))
            renewal_subscription = None

            for subscription in subscriptions:
                if subscription['package_id']:
                    query = """
                        SELECT mo.id
                        FROM meuml.modules mo
                        JOIN meuml.package_modules pm ON pm.module_id = mo.id
                        WHERE pm.package_id = :package_id
                    """
                    modules = self.fetchall(
                        query, {'package_id': subscription['package_id']})
                    subscription['modules'] = ','.join(
                        [str(module['id']) for module in modules])

                if accounts == subscription['accounts'] and total_price == float(subscription['price']):
                    if (package_id and str(package_id) == str(subscription['package_id'])) or (modules_id and str(modules_id) == str(subscription['modules'])):
                        renewal_subscription = subscription
                        break

            values = {
                'user_id': self.user['id'],
                'accounts_id': request.form.get('accounts_id'),
                'modules_id': modules_id,
                'package_id': package_id,
                'total_price': request.form.get('total_price'),
                'access_type': AccessType.subscription
            }

            if renewal_subscription:
                query = "SELECT renewals FROM meuml.internal_orders WHERE id = :id"
                last_order = self.fetchone(
                    query, {'id': renewal_subscription['internal_order_id']})

                query = """
                    INSERT INTO meuml.internal_orders (user_id, accounts_id, package_id, modules_id, total_price, access_type, renewals, renewed_subscription_id)
                    VALUES (:user_id,  :accounts_id, :package_id, :modules_id, :total_price, :access_type, :renewals, :renewed_subscription_id) 
                    RETURNING id
                """
                values['renewals'] = last_order['renewals'] if last_order and last_order['renewals'] else 1
                values['renewed_subscription_id'] = renewal_subscription['id']

                message = f'Pedido de renovação registrado. Realize o pagamento para estender a validade da assinatura de {renewal_subscription["expiration_date"].strftime("%d/%m/%Y")} para {(renewal_subscription["expiration_date"]+timedelta(days=30)).strftime("%d/%m/%Y")}'
            else:
                query = """
                    INSERT INTO meuml.internal_orders (user_id, accounts_id, package_id, modules_id, total_price, access_type)
                    VALUES (:user_id,  :accounts_id, :package_id, :modules_id, :total_price, :access_type) 
                    RETURNING id
                """
                message = f'Pedido registrado. Realize o pagamento para ativar a assinatura'

            try:
                values['id'] = self.execute_insert(query, values)
                if values['id'] is None:
                    raise Exception('ERROR DURING INSERT INTO INTERNAL_ORDERS')

            except Exception as e:
                print(e)
                self.abort_json({
                    'message': f'Erro ao registrar pedido de assinatura. Ordem cancelada',
                    'status': 'error',
                    'error': str(e),
                }, 500)

            return self.return_success(message, values)

    @jwt_required
    @prepare
    def cancel_subscription(self):
        pass
