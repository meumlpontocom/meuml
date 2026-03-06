from marshmallow.fields import String, Integer, Nested, DateTime, Number, Boolean, Dict, List, Float, Nested
from marshmallow.schema import Schema
from marshmallow import validates_schema, ValidationError
from marshmallow_jsonapi.flask import Schema, Relationship


class NewInvoiceSchema(Schema):
    class Meta:
        type_ = 'new_invoice'

    id = String()
    internal_order_id = Integer(dump_default=None, required=True)
    cpf_cnpj = String(dump_default=None, required=True) 
    razao_social = String(dump_default=None, required=True) 
    inscricao_municipal = String(dump_default=None, required=False, allow_none=True, load_default=None) 
    email = String(dump_default=None, required=True) 
    descricao_cidade = String(dump_default=None, required=True) 
    cep = String(dump_default=None, required=True) 
    tipo_logradouro = String(dump_default=None, required=True) 
    logradouro = String(dump_default=None, required=True) 
    tipo_bairro = String(dump_default=None, required=True) 
    codigo_cidade = String(dump_default=None, required=True) 
    complemento = String(dump_default=None, required=False, allow_none=True) 
    estado = String(dump_default=None, required=True) 
    numero = String(dump_default=None, required=True) 
    bairro = String(dump_default=None, required=True) 
