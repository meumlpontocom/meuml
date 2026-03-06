from marshmallow.fields import String, Integer, Nested, DateTime, Number, Boolean, Dict, List, Float, Nested
from marshmallow.schema import Schema
from marshmallow import validates_schema, ValidationError
from marshmallow_jsonapi.flask import Schema, Relationship


class NewInvoiceSchema(Schema):
    class Meta:
        strict = True
        type_ = 'new_invoice'

    id = String()
    internal_order_id = Integer(default=None, required=True)
    cpf_cnpj = String(default=None, required=True) 
    razao_social = String(default=None, required=True) 
    inscricao_municipal = String(default=None, required=False, allow_none=True, missing=None) 
    email = String(default=None, required=True) 
    descricao_cidade = String(default=None, required=True) 
    cep = String(default=None, required=True) 
    tipo_logradouro = String(default=None, required=True) 
    logradouro = String(default=None, required=True) 
    tipo_bairro = String(default=None, required=True) 
    codigo_cidade = String(default=None, required=True) 
    complemento = String(default=None, required=False, allow_none=True) 
    estado = String(default=None, required=True) 
    numero = String(default=None, required=True) 
    bairro = String(default=None, required=True) 
