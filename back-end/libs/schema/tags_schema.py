from marshmallow.fields import String, Integer, Nested, DateTime, Number, Boolean, Dict, List, Float, Nested
from marshmallow.schema import Schema
from marshmallow import validates_schema, ValidationError
from marshmallow_jsonapi.flask import Schema, Relationship


class CreateTagSchema(Schema):
    class Meta:
        type_ = 'create_tags'

    id = String()
    type_id = Integer(required=True)
    tags = List(String(), required=True)


class TagAdvertisingsSchema(Schema):
    class Meta:
        type_ = 'tag_advertisings'

    id = String()
    tags = List(String(), required=True)
    advertisings_id = List(String(), required=True)


class UntagAdvertisingsSchema(Schema):
    class Meta:
        type_ = 'untag_advertisings'

    id = String()
    tags = List(Integer(), required=True)
    advertisings_id = List(String(), required=True)


class TagFilesSchema(Schema):
    class Meta:
        type_ = 'tag_files'

    id = String()
    tags = List(String(), required=True)
    files_id = List(Integer(), required=True)


class UntagFilesSchema(Schema):
    class Meta:
        type_ = 'untag_files'

    id = String()
    tags = List(Integer(), required=True)
    files_id = List(Integer(), required=True)
