
from marshmallow.fields import List, String, Integer, DateTime, Boolean
from marshmallow.schema import Schema


class WarehouseSchema(Schema):
    name = String(
        required=True,
        error_messages={
            'required' : "O campo 'nome' é obrigatório"
        }
    )

    code = String(
        required=True,
        error_messages={
            'required' : "O campo 'código' é obrigatório"
        }
    )

    is_default = Boolean (
        required=False,
        default=False,
        missing=False
    )


class AccountWarehouseSchema(Schema):
    marketplace_id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'marketplace' é obrigatório"
        }
    )

    account_id = Integer(required=False, allow_none=True)
