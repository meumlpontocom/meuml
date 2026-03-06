from marshmallow.fields import String, Integer, DateTime, Boolean, List
from marshmallow.schema import Schema
from marshmallow.validate import Length
from marshmallow import validates_schema, ValidationError

class OrderListSchema(Schema):
    class Meta:
        strict = True
    
    orders_id = List(
        Integer(),
        many=True,
        required=True
    )

    file_type = String(required=True)
