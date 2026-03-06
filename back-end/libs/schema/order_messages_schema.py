from marshmallow.fields import String, Integer, Nested, DateTime, Number, Boolean, Dict, List, Float, Nested
from marshmallow.schema import Schema
from marshmallow import validates_schema, ValidationError
from marshmallow_jsonapi.flask import Schema, Relationship


class NewMessageOrderSchema(Schema):
    class Meta:
        type_ = 'new_order_message'

    id = String()
    text = String(dump_default=None, required=True) 
    attachments = List(String(), dump_default=None, required=False, allow_none=True)
