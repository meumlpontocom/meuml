import json
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required

from efipay import EfiPay

from libs.decorator.prepare import prepare
from libs.actions.actions import Actions
from libs.enums.access_type import AccessType
from libs.enums.gateway import Gateway
from libs.gateways.pjbank import PJBankApi
from libs.queue.queue import app as queue
from os import getenv

class PaymentActions(Actions):
    @jwt_required
    @prepare
    def payments (self):
        pass


    @jwt_required
    @prepare
    def internal_orders (self):
        fields = ['io.id', 'io.total_price', 'io.access_type', 'io.date_modified', 'at.title',
                'cc.id AS credit_id', 'cc.canceled', 'cc.authorized', 'cc.message AS creditcard_message', 'cc.date_modified AS "creditcard_modified"',
                'bo.id AS boleto_id', 'bo.finalized', 'bo.status', 'bo.url', 'bo.message AS boleto_message','bo.date_modified AS "boleto_modified"',
                'ii.status as nfse_status' ]
        query = f"""
            SELECT {','.join(fields)}
            FROM meuml.internal_orders io
            JOIN meuml.access_types at ON io.access_type = at.id
            LEFT JOIN meuml.creditcard_transactions cc ON io.id = cc.internal_order_id
            LEFT JOIN meuml.boleto_transactions bo ON io.id = bo.internal_order_id
            LEFT JOIN meuml.efi_transactions ef ON io.id = ef.internal_order_id
            LEFT JOIN meuml.invoices ii ON ii.internal_order_id = io.id
            WHERE io.user_id = :user_id AND (bo.id is not null OR cc.id is not null OR ef.id is not null)
        """
        count_query = """
            SELECT count(*)
            FROM meuml.internal_orders io
            LEFT JOIN meuml.creditcard_transactions cc ON io.id = cc.internal_order_id
            LEFT JOIN meuml.boleto_transactions bo ON io.id = bo.internal_order_id
            LEFT JOIN meuml.efi_transactions ef ON io.id = ef.internal_order_id
            WHERE io.user_id = :user_id
        """
        values = {'user_id':self.user['id']}

        query = self.order(request, fields, query, default_table='io', join_tables=['cc','bo'])
        params, query = self.paginate(request, query)
        internal_orders = self.fetchall(query, values)
        total = self.fetchone(count_query, values)['count']

        if total == 0:
            return self.return_success('Nenhum pedido localizado.', {})

        data = []
        for response in internal_orders:
            date_modified = response['date_modified']
            url = response['url']

            if response['boleto_id'] is None:
                if response['canceled'] == '1':
                    status = 'cancelado'
                elif response['authorized'] == '1':
                    status = 'confirmado'
                else:
                    status = 'em andamento'
                message = response['creditcard_message']
                payment_type = 'Cartão de Crédito'
                date_modified = response['creditcard_modified'] if response['creditcard_modified'] else date_modified

            else:
                status = response['status'] if response['status'] else 'em andamento'
                message = response['boleto_message']
                payment_type = 'Boleto Bancário'
                date_modified = response['boleto_modified'] if response['boleto_modified'] else date_modified

            if status == 'em andamento':
                status = 'pendente'

            data.append({
                'id': response['id'],
                'payment_type': payment_type,
                'price': response['total_price'],
                'title': response['title'],
                'date_modified': date_modified,
                'payment_status': status.title(),
                'message': message,
                'url': url,
                'nfse_status': response['nfse_status']
            })

        meta = self.generate_meta(params, total)

        return self.return_success(data=data, meta=meta)


    @jwt_required
    @prepare
    def create_creditcard_external_order_transaction (self):
        error = None
        gateway = int(request.form.get('gateway', 0))
        total_price = request.form.get('total_price')
        internal_order_id = request.form.get('internal_order_id')
        token = request.form.get('creditcard_token')

        if float(total_price) < 10:
            self.abort_json({
                'message': f'Desculpe! O valor mínimo aceito para transações é R$10,00',
                'status': 'error'
            }, 400)

        if not internal_order_id:
            self.abort_json({
                'message': f'ID do pedido obrigatório',
                'status': 'error'
            }, 400)

        if gateway == Gateway.PJBANK:
            api = PJBankApi()

            endpoint = f'/recebimentos/{api.credentials}/transacoes'
            data = {
                'token_cartao': token,
                'valor': total_price,
                'parcelas': 1,
                'pedido_numero': internal_order_id,
                'webhook': getenv('BASE_URL_API') + '/webhook/pjbank/creditcards'
            }

            query = """
                SELECT card_brand, card_number_truncated, card_token
                FROM meuml.creditcard_transactions
                WHERE user_id = :user_id AND gateway_id = :gateway_id AND card_number_truncated LIKE :card_number
                ORDER BY date_modified DESC
                LIMIT 1
            """
            values = {
                'user_id': self.user['id'],
                'gateway_id': Gateway.PJBANK,
                'card_number': '%' + request.form.get('creditcard_number','    ')[-4:]
            }
            creditcard = self.fetchone(query, values)

            if creditcard is None or creditcard.get('card_token') is None:
                data['nome_cartao'] = request.form.get('creditcard_name')
                data['mes_vencimento'] = request.form.get('creditcard_expiration_month')
                data['ano_vencimento'] = request.form.get('creditcard_expiration_year')
                data['cpf_cartao'] = request.form.get('creditcard_cpf')
                data['email_cartao'] = request.form.get('creditcard_email')
                data['celular_cartao'] = request.form.get('creditcard_phone')
                data['codigo_cvv'] = request.form.get('creditcard_cvv')

                if None in data.values():
                    empty_fields = ', '.join([key for key,value in data.items() if value is None or len(value) == 0])
                    self.abort_json({
                        'message': f'Preencha todos os campos obrigatórios ({empty_fields})',
                        'status': 'error'
                    }, 400)

                if  len(data['mes_vencimento']) != 2 or not data['mes_vencimento'].isdigit() or int(data['mes_vencimento']) < 1 or int(data['mes_vencimento']) > 12:
                    self.abort_json({
                        'message': f'O mês de vencimento deve estar entre 01 e 12 e possuir 2 dígitos',
                        'status': 'error'
                    }, 400)

                if not data['ano_vencimento'].isdigit() or len(data['ano_vencimento']) != 4:
                    self.abort_json({
                        'message': f'O ano de vencimento deve possuir 4 dígitos',
                        'status': 'error'
                    }, 400)

                now = datetime.now()
                if int(data['ano_vencimento']) < now.year or (int(data['ano_vencimento']) == now.year and int(data['mes_vencimento']) < now.month):
                    self.abort_json({
                        'message': f'Este cartão está vencido',
                        'status': 'error'
                    }, 400)

                if not self.isCpfValid(data['cpf_cartao']) and not self.isCnpjValid(data['cpf_cartao']):
                    self.abort_json({
                        'message': f'CPF/CNPJ inválido',
                        'status': 'error'
                    }, 400)

                if not 8 <= len(data['nome_cartao']) <= 80:
                    self.abort_json({
                        'message': f'O nome deve ter entre 8 e 80 caracteres',
                        'status': 'error'
                    }, 400)

                if not 8 <= len(data['email_cartao']) <= 80:
                    self.abort_json({
                        'message': f'O email deve ter entre 8 e 80 caracteres',
                        'status': 'error'
                    }, 400)

            else:
                data['token_cartao'] = creditcard['card_token']

            try:
                response = api.post(endpoint, data=data)
            except Exception as e:
                print(e)
                self.abort_json({
                    'message': 'Desculpe, não foi possível concluir a transação. Pedido cancelado',
                    'status': 'error'
                }, 500)

            status_code = response.status_code
            response = response.json()

            if status_code == 504:
                response = api.post(endpoint, data=data)
                status_code = response.status_code
                response = response.json()


            if status_code not in [200,201]:
                print(data)
                error = response

            if status_code in [200,201]:
                values = {
                    'user_id': self.user['id'],
                    'internal_order_id': internal_order_id,
                    'gateway_id': Gateway.PJBANK,
                    'external_id': response.get('tid'),
                    'amount': total_price,
                    'card_brand': response.get('bandeira'),
                    'card_number_truncated': response.get('cartao_truncado'),
                    'card_token': token,
                    'authorized': response.get('autorizada', '0'),
                    'canceled':response.get('cancelada', '0'),
                    'message': response.get('msg', '') if len(response.get('msg', '')) > 0 else None
                }

                if response.get('autorizada','0') != '1':
                    values['canceled'] = '1'

                query = """
                    INSERT INTO meuml.creditcard_transactions (user_id, internal_order_id, gateway_id, external_id, amount, card_brand, card_number_truncated, card_token, authorized, canceled, message)
                    VALUES (:user_id, :internal_order_id, :gateway_id, :external_id, :amount, :card_brand, :card_number_truncated, :card_token, :authorized, :canceled, :message)
                """
                self.execute(query, values)

                if response.get('cancelada','0') != '1' and response.get('autorizada','0') == '1':
                    response['tipo'] = 'recebimento_cartao'
                    response['valor'] = total_price
                    process_payment = queue.signature('local_priority:notification_process_payment_pjbank')
                    process_payment.delay(internal_order_id, response)
                    return self.return_success('Transação processada com sucesso')
                else:
                    message = response.get('msg', '') if len(response.get('msg', '')) > 0 else 'Desculpe, não foi possível concluir a transação.'
                    self.abort_json({
                        'message': message,
                        'status': 'error'
                    }, 403)

            elif status_code == 501:
                self.abort_json({
                    'message': f'Desculpe, não foi possível concluir a transação. Motivo: cartão vencido',
                    'status': 'error',
                    'error': error
                }, 501)

            elif status_code == 502:
                self.abort_json({
                    'message': f'Desculpe, não foi possível concluir a transação. Motivo: falha permanente, cartão não aceito',
                    'status': 'error',
                    'error': error
                }, 502)

            elif status_code == 503:
                self.abort_json({
                    'message': f'Desculpe, nã foi possível concluir a transação. Motivo: falha temporária, tente outro dia',
                    'status': 'error',
                    'error': error
                }, 503)

            elif status_code == 500:
                self.abort_json({
                    'message': f'Desculpe, não foi possível concluir a transação. Tente novamente mais tarde',
                    'status': 'error',
                    'error': error
                }, 504)

        self.abort_json({
                'message': f'Erro ao processar transação. Tente novamente',
                'status': 'error',
                'error': error
            }, 500)


    @jwt_required
    @prepare
    def create_boleto_external_order_transaction (self):
        error = None
        gateway = int(request.form.get('gateway', 0))
        gateway = 2
        total_price = request.form.get('total_price')
        internal_order_id = request.form.get('internal_order_id')

        name = request.form.get('client_name')
        cpf = request.form.get('cpf')
        address = request.form.get('address')
        address_number = request.form.get('address_number')
        address_additional_info = request.form.get('address_additional_info')
        zip_code = request.form.get('zip_code')
        district = request.form.get('district')
        city = request.form.get('city')
        state = request.form.get('state')
        due_date = (
            datetime.now() + timedelta(days=int(getenv('EXPIRES_IN_X_DAYS')))
        )

        if float(total_price) < 20:
            self.abort_json({
                'message': f'Desculpe! O valor mínimo aceito para transações é R$20,00',
                'status': 'error'
            }, 400)

        if not internal_order_id:
            self.abort_json({
                'message': f'ID do pedido obrigatório',
                'status': 'error'
            }, 400)

        if not name or not 3 <= len(name) <= 64:
            self.abort_json({
                'message': f'O nome deve ter entre 3 e 64 caracteres',
                'status': 'error'
            }, 400)

        if not self.isCpfValid(cpf) and not self.isCnpjValid(cpf):
            self.abort_json({
                'message': f'CPF/CNPJ inválido',
                'status': 'error'
            }, 400)

        if not zip_code.isdigit() or not 8 <= len(zip_code) <= 10:
            self.abort_json({
                'message': f'O CEP deve ter entre 8 e 10 dígitos',
                'status': 'error'
            }, 400)

        if not address or not 3 <= len(address) <= 128:
            self.abort_json({
                'message': f'O endereço deve ter entre 3 e 128 caracteres',
                'status': 'error'
            }, 400)

        if not address_number or not address_number.isdigit() or not 1 <= len(address_number) <= 10:
            self.abort_json({
                'message': f'O numero de endereço deve estar entre 0 9999999999',
                'status': 'error'
            }, 400)

        if address_additional_info and len(address_additional_info) > 80:
            self.abort_json({
                'message': f'O complemento do endereço deve ter no máximo 80 caracteres',
                'status': 'error'
            }, 400)

        if not district or not 3 <= len(district) <= 64:
            self.abort_json({
                'message': f'O bairro deve ter entre 3 e 64 caracteres',
                'status': 'error'
            }, 400)

        if not city or not 3 <= len(city) <= 80:
            self.abort_json({
                'message': f'A cidade deve ter entre 3 e 80 caracteres',
                'status': 'error'
            }, 400)

        states = {
            'ACRE': 'AC',
            'ALAGOAS': 'AL',
            'AMAPÁ': 'AP',
            'AMAZONAS': 'AM',
            'BAHIA': 'BA',
            'CEARÁ': 'CE',
            'DISTRITO FEDERAL': 'DF',
            'ESPÍRITO SANTO': 'ES',
            'GOIÁS': 'GO',
            'MARANHÃO': 'MA',
            'MATO GROSSO': 'MT',
            'MATO GROSSO DO SUL': 'MS',
            'MINAS GERAIS': 'MG',
            'PARÁ': 'PA',
            'PARAÍBA': 'PB',
            'PARANÁ': 'PR',
            'PERNAMBUCO': 'PE',
            'PIAUÍ': 'PI',
            'RIO DE JANEIRO': 'RJ',
            'RIO GRANDE DO NORTE': 'RN',
            'RIO GRANDE DO SUL': 'RS',
            'RONDÔNIA': 'RO',
            'RORAIMA': 'RR',
            'SANTA CATARINA': 'SC',
            'SÃO PAULO': 'SP',
            'SERGIPE': 'SE',
            'TOCANTINS': 'TO'
        }

        state = state.upper()

        if not state or (state not in states.values() and not states.get(state)):
            self.abort_json({
                'message': f'O estado não é válido.',
                'status': 'error'
            }, 400)

        if gateway == Gateway.PJBANK:
            query = """
            SELECT io.id, io.package_id, io.modules_id, io.access_type, io.accounts_id, pa.title, pa.price, string_agg(mo.title, ', ' ORDER BY mo.title) AS modules
                FROM meuml.internal_orders io
                LEFT JOIN meuml.packages pa ON io.package_id = pa.id
                LEFT JOIN meuml.package_modules pm ON pm.package_id = pa.id
                LEFT JOIN meuml.modules mo ON pm.module_id = mo.id
                WHERE io.id = :id
                GROUP BY io.id,io.package_id,pa.title,pa.price
            """
            internal_order = self.fetchone(query, {'id': internal_order_id})

            if internal_order is None:
                self.abort_json({
                    'message': f'Erro ao gerar boleto. Pedido não encontrado',
                    'status': 'error',
                }, 500)

            if internal_order['access_type'] == AccessType.credits:
                text = "Cobrança referente a compra de créditos para uso interno no sistema MeuML.com\n\n"
                text += "Atenção: os créditos serão liberados somente após a confirmação do pagamento pela instituição autorizadora"

            elif internal_order['access_type'] == AccessType.subscription:
                text = "Cobrança referente a assinatura do sistema MeuML.com\n\n"

                if internal_order['package_id']:
                    text += f"Pacote {internal_order['title']}\t\tR$ {str(internal_order['price']).replace('.',',')}\n"

                elif internal_order['modules_id']:
                    text += "Pacote Personalizado\n"

                    modules_id_list = [int(m.strip()) for m in internal_order['modules_id'].split(',')]
                    modules = self.fetchall("SELECT title, price FROM meuml.modules WHERE id = ANY(:modules_id)", {'modules_id': modules_id_list})
                    for module in modules:
                        text += f"{module['title']}\t\tR$ {str(module['price']).replace('.',',')}\n"

                text += f"Contas: {internal_order['accounts_id']}\n\n"
                text += "Atenção: o acesso aos módulos será liberado somente após a confirmação do pagamento pela instituição autorizadora"

            api = PJBankApi()
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CHAVE': api.boleto_key
            }
            data = {
                'vencimento': due_date.strftime('%m/%d/%Y'),
                'valor': total_price,
                'juros': 0,
                'juros_fixo': 0,
                'multa': 0,
                'multa_fixo': 0,
                'desconto': 0,
                'diasdesconto1': 0,
                'desconto2': 0,
                'diasdesconto2': 0,
                'desconto3': 0,
                'diasdesconto3': 0,
                'nunca_atualizar_boleto': 0,
                'nome_cliente': name,
                'email_cliente': '',
                # 'telefone_cliente':,
                'cpf_cliente': cpf,
                'endereco_cliente': address,
                'numero_cliente': address_number,
                'complemento_cliente': address_additional_info,
                'bairro_cliente': district,
                'cidade_cliente': city,
                'estado_cliente': state,
                'cep_cliente': zip_code,
                'logo_url': getenv('LOGO_MEUML'),
                'texto': text,
                # 'instrucao_adicional': '',
                'pedido_numero': internal_order_id,
                'webhook': getenv('BASE_URL_API') + '/webhook/pjbank/boletos',
                'pix': 'pix'
            }

            try:
                endpoint = f'/recebimentos/{api.boleto_credentials}/transacoes'
                response = api.post(endpoint, headers=headers, data=data)
            except Exception as e:
                print(e)
                self.abort_json({
                    'message': 'Desculpe, não foi possível concluir a transação. Pedido Cancelado',
                    'status': 'error'
                }, 500)

            status_code = response.status_code

            if status_code in [200, 201]:
                response = response.json()
                values = {
                    'user_id': self.user['id'],
                    'internal_order_id': data['pedido_numero'],
                    'gateway_id': Gateway.PJBANK,
                    'external_id': response.get('id_unico'),
                    'expires_at': due_date,
                    'amount': data['valor'],
                    'url': response.get('linkBoleto'),
                }

                query = """
                    INSERT INTO meuml.boleto_transactions (user_id, internal_order_id, gateway_id, external_id, expires_at, amount, url)
                    VALUES (:user_id, :internal_order_id, :gateway_id, :external_id, :expires_at, :amount, :url)
                """
                self.execute(query, values)

                return self.return_success(
                    'Link PIX', response.get('linkBoleto')
                )
                # return self.return_success(
                #     'Link PIX',
                #     {
                #         'url': response.get('linkBoleto'),
                #         'imageqrcode': '',
                #         'qrcode': '',
                #         'duedate': '',
                #         'gateway': gateway
                #     }
                # )

            if status_code not in [200, 201]:
                print(data)
                error = response.json()

        elif gateway == Gateway.EFI:
            query = """
            SELECT io.id, io.package_id, io.modules_id, io.access_type, io.accounts_id, pa.title, pa.price, string_agg(mo.title, ', ' ORDER BY mo.title) AS modules
                FROM meuml.internal_orders io
                LEFT JOIN meuml.packages pa ON io.package_id = pa.id
                LEFT JOIN meuml.package_modules pm ON pm.package_id = pa.id
                LEFT JOIN meuml.modules mo ON pm.module_id = mo.id
                WHERE io.id = :id
                GROUP BY io.id,io.package_id,pa.title,pa.price
            """
            internal_order = self.fetchone(query, {'id': internal_order_id})

            if internal_order is None:
                self.abort_json({
                    'message': f'Erro ao gerar boleto. Pedido não encontrado',
                    'status': 'error',
                }, 500)

            if internal_order['access_type'] == AccessType.credits:
                text = "Cobrança referente a compra de créditos para uso interno no sistema MeuML.com\n\n"
                text += "Atenção: os créditos serão liberados somente após a confirmação do pagamento pela instituição autorizadora"

            elif internal_order['access_type'] == AccessType.subscription:
                text = "Cobrança referente a assinatura do sistema MeuML.com\n\n"

                if internal_order['package_id']:
                    text += f"Pacote {internal_order['title']}\t\tR$ {str(internal_order['price']).replace('.',',')}\n"

                elif internal_order['modules_id']:
                    text += "Pacote Personalizado\n"

                    # modules = self.fetchall(f"SELECT title, price FROM meuml.modules WHERE id IN ({internal_order['modules_id']})")
                    # for module in modules:
                    #     text += f"{module['title']}\t\tR$ {str(module['price']).replace('.',',')}\n"

                # text += f"Contas: {internal_order['accounts_id']}\n\n"
                text += "Atenção: o acesso aos módulos será liberado somente após a confirmação do pagamento pela instituição autorizadora"

            credentials = {
                'client_id': getenv('EFI_CLIENT_ID'),
                'client_secret': getenv('EFI_CLIENT_SECRET'),
                'sandbox': False if getenv('EFI_SANDBOX') == 'False' else True,
                'certificate': getenv('EFI_CERTIFICATE')
            }

            efi = EfiPay(credentials)

            total_price = f'{float(total_price):.2f}'

            body = {
                'calendario': {
                    'expiracao': int(getenv('EFI_EXPIRATION'))
                },
                'devedor': {
                    # 'cpf': cpf,
                    'nome': name
                },
                'valor': {
                    'original': total_price
                },
                'chave': getenv('EFI_CHAVE_PIX'),
                'infoAdicionais': [
                    {
                        'nome': 'MeuML.com',
                        'valor': text
                    },
                    {
                        'nome': 'Número do pedido',
                        'valor': str(internal_order['id'])
                    }
                ]
            }

            if len(cpf) == 11:
                body['devedor']['cpf'] = cpf
            else:
                body['devedor']['cnpj'] = cpf

            try:
                charge = efi.pix_create_immediate_charge(body=body)

                if 'erros' not in charge:
                    params = {
                        'id': charge['loc']['id']
                    }

                    qrcode = efi.pix_generate_qrcode(params=params)
            except Exception as e:
                print(e)
                self.abort_json({
                    'message': f'Desculpe, não foi possível concluir a transação. Pedido Cancelado! {str(charge)}',
                    'status': 'error'
                }, 500)

            if 'erros' in charge or 'erros' in qrcode:
                error = charge
            else:
                values = {
                    'user_id': self.user['id'],
                    'internal_order_id': internal_order_id,
                    'gateway_id': Gateway.EFI,
                    'external_id': charge.get('txid'),
                    'expires_at': due_date,
                    'amount': total_price,
                    'url': qrcode.get('linkVisualizacao'),
                    'imageqrcode': qrcode.get('imagemQrcode'),
                    'qrcode': qrcode.get('qrcode'),
                }

                query = """
                    INSERT INTO meuml.efi_transactions
                        (
                            user_id, internal_order_id, gateway_id,
                            external_id, expires_at, amount, url,
                            imageqrcode, qrcode
                        )
                    VALUES (
                        :user_id, :internal_order_id, :gateway_id,
                        :external_id, :expires_at, :amount, :url,
                        :imageqrcode, :qrcode
                    )
                """
                self.execute(query, values)

                return self.return_success(
                    'Link PIX', qrcode.get('linkVisualizacao')
                )
                # return self.return_success(
                #     'Link PIX',
                #     {
                #         'url': qrcode.get('linkVisualizacao'),
                #         'imageqrcode': qrcode.get('imagemQrcode'),
                #         'qrcode': qrcode.get('qrcode'),
                #         'duedate': due_date,
                #         'gateway': gateway
                #     }
                # )

        self.abort_json(
            {
                'message': f'Erro ao gerar PIX. Tente novamente',
                'status': 'error',
                'error': error
            }, 500)

    def isCpfValid(self, cpf, d1=0, d2=0, i=0):
        if not cpf:
            return False

        cpf = cpf.replace('.','').replace('-','')
        if len(cpf) != 11 or not cpf.isdigit():
            return False

        while i < 10:
            d1, d2, i = (d1+(int(cpf[i])*(11-i-1)))%11 if i<9 else d1, (d2+(int(cpf[i])*(11-i)))%11, i+1
        return (int(cpf[9])==(11-d1 if d1>1 else 0)) and (int(cpf[10])==(11-d2 if d2>1 else 0))


    def isCnpjValid(self, cnpj):
        if not cnpj:
            return False

        cnpj = ''.join([digit for digit in cnpj if digit.isdigit()])

        if len(cnpj) < 14:
            return False

        novo = list(map(int,cnpj[:12]))

        prod = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        while len(novo) < 14:
            r = sum([x*y for (x, y) in zip(novo, prod)]) % 11
            if r > 1:
                f = 11 - r
            else:
                f = 0
            novo.append(f)
            prod.insert(0, 6)

        cnpj_processado = ''.join([str(digit) for digit in novo])
        if cnpj_processado == cnpj:
            return cnpj

        return False
