from marshmallow.fields import String, Integer, Dict
from marshmallow.schema import Schema as Schema2


class ShippingModificationTemplateSchema(Schema2):
    class Meta:
        strict = True
        type_ = 'shipping'
    account_id = Integer(required=True)
    logistic_type = String(required=True)
    processing_times = Dict(required=True)
