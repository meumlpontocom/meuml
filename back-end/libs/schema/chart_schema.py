from marshmallow.fields import String, Integer, Nested, DateTime, Number, Boolean, Dict, List, Float
from marshmallow.schema import Schema as Schema2
from marshmallow import validates_schema, ValidationError
from marshmallow_jsonapi.flask import Schema, Relationship
from marshmallow.validate import Length

class ChartModificationTemplateSchema(Schema2):
    class Meta:
        type_ = 'chart'
    account_id = Integer(required=True)
    chart = Dict(required=True)


class ChartRowTemplateSchema(Schema2):

    class Meta:
        type_ = 'chart'
    account_id = Integer(required=True)
    attributes = List(Dict(), required=True)
    type = String(required=True)

class ChartSearchSchema(Schema2):

    class Meta:
        type_ = 'chart'
    account_id = Integer(required=True)
    domain_id = String(required=True)
    attributes = List(Dict(), required=True)

class ChartTemplateSchema(Schema2):
    class Meta:
        type_ = 'chart'
    account_id = Integer(required=True)
    name = String(required=True)
    domain_id = String(required=True)
    attributes = List(Dict(), required=True)
    main_attribute = Dict(required=True)
    rows = List(Dict(), required=True)

class ChartAdvertisingSelectionSchema(Schema2):
    class Meta:
        pass

    advertisings_id = List(
        String(),
        many=True,
        required=True
    )
    account_id = Integer(required=True)
    chart_id = String(required=True)
    row_id = String(required=True)
