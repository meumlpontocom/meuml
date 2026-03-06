
from marshmallow.fields import List, String, Integer, DateTime, Boolean, Nested, Date, Float
from marshmallow.schema import Schema
from marshmallow.validate import Length
from marshmallow import validates_schema, ValidationError


class StockInSchema(Schema):
    class Meta:
        strict = True

    warehouse_id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'armazém' é obrigatório"
        }
    )
    quantity = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'quantidade' é obrigatório"
        }
    )
    price_buy = Float(
        required=True,
        error_messages={
            'required' : "O campo 'preço' é obrigatório"
        }
    )
    expiration_date = Date(format='%d/%m/%Y', required=False, allow_none=True, missing=None)
    buy_id = String(required=False, allow_none=True, missing=None)


class StockOutSchema(Schema):
    class Meta:
        strict = True

    warehouse_id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'armazém' é obrigatório"
        }
    )
    quantity = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'quantidade' é obrigatório"
        }
    )
    price_sell = Float(
        required=True,
        error_messages={
            'required' : "O campo 'preço' é obrigatório"
        }
    )
    stock_item_id = Integer(required=False, allow_none=True, missing=None)
    sell_id = String(required=False, allow_none=True, missing=None)
    marketplace_id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'canal de venda' é obrigatório"
        }
    )
    account_id = Integer(required=False, allow_none=True, default=None, missing=None)

class StockItemSchema(Schema):
    class Meta:
        strict = True

    warehouse_id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'armazém' é obrigatório"
        }
    )
    quantity = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'quantidade' é obrigatório"
        }
    )
    price_buy = Float(
        required=True,
        error_messages={
            'required' : "O campo 'preço' é obrigatório"
        }
    )
    expiration_date = Date(format='%d/%m/%Y', required=False, allow_none=True, missing=None)


class StockSchema(Schema):
    class Meta:
        strict = True
    
    items = List(
        Nested(StockItemSchema),
        validate=Length(
            min=1,
            error='Nenhum produto válido foi submetido'
        ),
        many=True,
        required=True
    )
