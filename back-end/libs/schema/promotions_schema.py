from marshmallow.fields import String, Integer, Dict, List
from marshmallow.schema import Schema
class PromotionItemSchema(Schema):
    class Meta:
        strict = True
        type_ = 'promotion_advertising'

    id = String()
    advertisings_id = List(
        String(),
        required=False,
        allow_none=True,
        default=None,
        missing=None,
    )
    promotion_id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'promotion_id' é obrigatório"
        }
    )
    options = Dict(
        required=False,
        allow_none=True,
        default=None,
        missing=None,
    )
