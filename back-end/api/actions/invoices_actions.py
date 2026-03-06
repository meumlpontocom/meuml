import json
import requests
import traceback
from datetime import datetime, timedelta
from flask import request, redirect
from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare
from libs.enums.access_type import AccessType 
from libs.plugnotas_api.plugnotas_api import PlugNotasApi
from libs.queue.queue import app as queue
from libs.schema.invoices_schema import NewInvoiceSchema
from os import getenv

class InvoiceActions(Actions):
    @jwt_required 
    @prepare
    def create_invoice(self):
      self.validate(NewInvoiceSchema())
      request_data = self.data
      
      request_data['user_id'] = self.user['id']
      internal_order_id = request_data.pop('internal_order_id')

      query = """
        SELECT 
            io.id, io.total_price, io.package_id, io.modules_id, 
            io.access_type, io.accounts_id, pa.title 
        FROM meuml.internal_orders io 
        LEFT JOIN meuml.packages pa
          ON io.package_id = pa.id
        LEFT JOIN meuml.package_modules pm 
          ON pm.package_id = pa.id
        WHERE io.id = :id 
        GROUP BY io.id, io.package_id, pa.title
      """
      internal_order = self.fetchone(query, {'id': internal_order_id})

      if internal_order is None:
        self.abort_json({
            'message': f'Pedido #{internal_order_id} não encontrado',
            'status': 'error',
        }, 400)

      query = """
        SELECT * 
        FROM meuml.invoices 
        WHERE internal_order_id = :id
      """
      invoice = self.fetchone(query, {'id': internal_order_id})

      if invoice is not None:
        self.abort_json({
            'message': f'Pedido #{internal_order_id} já possui uma solicitação de NFSe',
            'status': 'error',
        }, 400)       

      try:
        query = """
          INSERT INTO meuml.clients (user_id, cpf_cnpj, razao_social, inscricao_municipal, email, descricao_cidade, 
              cep, tipo_logradouro, logradouro, tipo_bairro, codigo_cidade, complemento, estado, numero, bairro)
          VALUES (:user_id, :cpf_cnpj, :razao_social, :inscricao_municipal, :email, :descricao_cidade, :cep,
              :tipo_logradouro, :logradouro, :tipo_bairro, :codigo_cidade, :complemento, :estado, :numero, :bairro)
          ON CONFLICT (cpf_cnpj) 
            DO UPDATE SET
              user_id = excluded.user_id,
              razao_social = excluded.razao_social,
              inscricao_municipal = excluded.inscricao_municipal,
              email = excluded.email,
              descricao_cidade = excluded.descricao_cidade,
              cep = excluded.cep,
              tipo_logradouro = excluded.tipo_logradouro,
              logradouro = excluded.logradouro,
              tipo_bairro = excluded.tipo_bairro,
              codigo_cidade = excluded.codigo_cidade,
              complemento = excluded.complemento,
              estado = excluded.estado,
              numero = excluded.numero,
              bairro = excluded.bairro
          RETURNING id
        """
        client_id = self.execute_insert(query, request_data)

        self.execute("UPDATE meuml.internal_orders SET client_id = :client_id WHERE id = :id", {'client_id': client_id, 'id': internal_order_id})
        return self.return_success('Dados registrados para emissão de NFSe após confirmação do pagamento.')

        if internal_order['access_type'] == AccessType.credits:
            text = "NFSe referente a compra de créditos para uso interno no sistema MeuML.com"

        elif internal_order['access_type'] == AccessType.subscription:
            text = "NFSe referente a assinatura do sistema MeuML.com|"
            
            if internal_order['package_id']:
                text += f"Pacote {internal_order['title']}"
            
            elif internal_order['modules_id']:
                text += "Pacote Personalizado: "

                modules = self.fetchall(f"SELECT title FROM meuml.modules WHERE id IN ({internal_order['modules_id']})")
                modules = [module['title'] for module in modules]
                text += ", ".join(modules)

            text += f"|Contas: {internal_order['accounts_id']}"

        pn_api = PlugNotasApi()
        service = pn_api.API_SERVICE
        service['discriminacao'] = text
        service['valor']['servico'] = internal_order['total_price'] 

        invoice_json = [
          {
            "idIntegracao": str(internal_order_id),
            "enviarEmail": True,
            "prestador": pn_api.API_PROVIDER,
            "tomador": {
              "cpfCnpj": ''.join([char for char in request_data['cpf_cnpj'] if char.isdigit()]),
              "razaoSocial": request_data['razao_social'],
              "inscricaoMunicipal": ''.join([char for char in request_data['inscricao_municipal'] if char.isdigit()]),
              "email": request_data['email'],
              "endereco": {
                "descricaoCidade": request_data['descricao_cidade'],
                "cep": ''.join([char for char in request_data['cep'] if char.isdigit()]),
                "tipoLogradouro": request_data['tipo_logradouro'],
                "logradouro": request_data['logradouro'],
                "tipoBairro": request_data['tipo_bairro'],
                "codigoCidade": ''.join([char for char in request_data['codigo_cidade'] if char.isdigit()]),
                "complemento": request_data.get('complemento'),
                "estado": request_data['estado'],
                "numero": ''.join([char for char in request_data['numero'] if char.isdigit()]),
                "bairro": request_data['bairro']
              }
            },
            "servico": [ service ]
          }
        ]

        if request_data['inscricao_municipal'] is not None:
          invoice_json[0]['tomador']['inscricaoMunicipal'] = ''.join([char for char in request_data['inscricao_municipal'] if char.isdigit()])
      
      except Exception as e:
        print(e)
        print(traceback.format_exc())
        self.abort_json({
            'message': 'Erro interno durante a geração de NFSe',
            'status': 'error',
        }, 500)

      response = pn_api.post('/nfse', json=invoice_json)
      response_data = response.json()
      status_code = response.status_code

      if status_code != 200:
        query = """
          DELETE FROM meuml.invoices 
          WHERE internal_order_id = :id
        """
        self.execute(query, {'id': internal_order_id})
        self.abort_json({
            'message': response_data.get('error', {}).get('message','Erro na geração de NFSe'),
            'status': 'error',
        }, response.status_code)

      query = """
        INSERT INTO meuml.invoices (client_id, internal_order_id, status, external_id)
        VALUES (:client_id, :internal_order_id, :status, :external_id)
      """
      values = {
        'client_id': client_id,
        'internal_order_id': internal_order_id,
        'external_id': response_data['documents'][0]['id'],
        'status': 'PROCESSANDO'
      }
      self.execute(query, values)
    
      return self.return_success('NFSe em processamento, confira o andamento em Histórico')

    
    @jwt_required 
    @prepare
    def check_invoice_status(self, internal_order_id):
      query = """
        SELECT * 
        FROM meuml.invoices 
        WHERE internal_order_id = :id
      """
      invoice = self.fetchone(query, {'id': internal_order_id})

      if invoice is None:
        self.abort_json({
            'message': f'NFSe do Pedido #{internal_order_id} não encontrada',
            'status': 'error',
        }, 400)  

      pn_api = PlugNotasApi()
      response = pn_api.get(f'/nfse/{invoice["external_id"]}')

      if response.status_code != 200:
        self.abort_json({
          'message': 'Erro de comunicação com o Gateway de Nota Fiscal',
          'status': 'error',
        }, 502)

      status = response.json()['status']

      if status != invoice['status']:
        query = """
          UPDATE meuml.invoices 
            SET status = :status
            WHERE internal_order_id = :id
        """
        self.execute(query, {'status': status, 'id': internal_order_id})
      
      return self.return_success(data={'status': status})


    @jwt_required 
    def download_invoice_status_pdf(self, invoice_id):
      url = getenv('PLUGNOTAS_API_URL') + '/nfse/pdf/' + invoice_id
      return self.return_success(data={'url': url})


    @jwt_required 
    def download_invoice_status_xml(self, invoice_id):
      url = getenv('PLUGNOTAS_API_URL') + '/nfse/xml/' + invoice_id
      return self.return_success(data={'url': url})


    @jwt_required
    def get_cep_data(self, cep):
      cep = ''.join([character for character in cep if character.isdigit()])
      response = requests.get(f'https://viacep.com.br/ws/{cep}/json/')

      if response.status_code != 200:
        self.abort_json({
            'message': f'Falha ao recuperar informações do CEP informado',
            'status': 'error',
        }, 502)  

      return self.return_success(data=response.json())


    @jwt_required
    def get_cnpj_data(self, cnpj):
      cnpj = ''.join([character for character in cnpj if character.isdigit()])
      
      pn_api = PlugNotasApi()
      response = pn_api.post(f'/cnpj/{cnpj}')

      if response.status_code != 200:
        self.abort_json({
            'message': f'Falha ao recuperar informações do CNPJ informado',
            'status': 'error',
        }, 502)  

      return self.return_success(data=response.json())


    @jwt_required 
    @prepare
    def get_client_data(self):
      query = """
        SELECT * 
        FROM meuml.clients
        WHERE user_id = :id
      """
      clients = self.fetchall(query, {'id': self.user['id']})
      
      return self.return_success(data=clients)


    @jwt_required 
    @prepare
    def resend_email(self, internal_order_id):
      query = """
        SELECT * 
        FROM meuml.invoices 
        WHERE internal_order_id = :id
      """
      invoice = self.fetchone(query, {'id': internal_order_id})

      if invoice is None:
        self.abort_json({
            'message': f'NFSe do Pedido #{internal_order_id} não encontrada',
            'status': 'error',
        }, 400)       

      pn_api = PlugNotasApi()

      response = pn_api.post(f'/nfse/email/{invoice["external_id"]}', json={
        "reenvio": True,
        "destinatarios": [request.args('email')]
      })
      status_code = response.status_code

      if status_code != 200:
        self.abort_json({
            'message': 'Erro de comunicação com o Gateway de Notas',
            'status': 'error',
        }, 502)
    
      return self.return_success(f'Em breve você receberá o PDF e XML da NFSe referente ao Pedido #{internal_order_id}')
