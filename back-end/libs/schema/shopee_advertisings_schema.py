from marshmallow.fields import (
    String,
    Integer,
    Boolean,
    Dict,
    List,
    Float,
    Nested,
)
from marshmallow_jsonapi.flask import Schema
from marshmallow.schema import Schema as Sc


class AdvertisingListSchema(Schema):
    class Meta:
        type_ = "shopee_duplicate_advertising_list"

    id = Integer()
    allow_duplicated_account = Boolean(dump_default=False, required=True)
    allow_duplicated_title = Boolean(dump_default=False, required=True)
    account_id = List(Integer(), required=True)
    advertisings = List(Dict(), required=True)
    mass_override = Dict(dump_default=None, allow_none=True, load_default=None)
    

class DimensionSchema(Sc):
    class Meta: 
        pass
    
    package_height = Float(required=True, error_messages={
        "required": "O campo 'package_height' é obrigatório",
        "invalid": "O campo 'package_height' é inválido",
    })
    package_length = Float(required=True, error_messages={
        "required": "O campo 'package_length' é obrigatório",
        "invalid": "O campo 'package_length' é inválido",
    })
    package_width = Float(required=True, error_messages={
        "required": "O campo 'package_width' é obrigatório",
        "invalid": "O campo 'package_width' é inválido",
    })    

class AdvertisingSchema(Sc):
    class Meta: 
        pass
    
    id = String(required=True)
    title = String(required=True, error_messages={
        "required": "O campo 'title' é obrigatório",
        "invalid": "O campo 'title' é inválido",
    })
    account_id = Integer(required=True, error_messages={
        "required": "O campo 'account_id' é obrigatório",
        "invalid": "O campo 'account_id' é inválido",
    })
    category_id = Integer(required=True, error_messages={
        "required": "O campo 'category_id' é obrigatório",
        "invalid": "O campo 'category_id' é inválido",
    })
    dimension = Nested(DimensionSchema(), required=True, error_messages={
        "required": "O campo 'dimension' é obrigatório",
        "invalid": "O campo 'dimension' é inválido",
    })
    weight = Float(required=True, error_messages={
        "required": "O campo 'weight' é obrigatório",
        "invalid": "O campo 'weight' é inválido",
    })

class AttributesSchema(Sc):
    class Meta: 
        pass
        
    account_id = List(Integer(), required=True, error_messages={
        "required": "O campo 'account_id' é obrigatório",
        "invalid": "O campo 'account_id' é inválido",
    })
    advertisings = List(Nested(AdvertisingSchema()), required=True, error_messages={
        "required": "O campo 'advertisings' é obrigatório",
        "invalid": "O campo 'advertisings' é inválido",
    })

class AdvertisingReplicateSchema(Sc):
    class Meta:
        pass

    attributes = Dict(Nested(AttributesSchema, required=True))
    

class MassAlterPriceSchema(Sc):
    class Meta:
        pass

    advertisings_id = List(Integer(), required=True)
    is_percentage = Boolean(required=True)
    change_type = String(required=True)
    change_value = Float(required=True)


class MassAlterDescription(Sc):
    class Meta:
        pass

    user_id = Integer(required=True)
    account_id = Integer(required=True)
    adverts_ids = List(Integer(), required=False)


class AdvertisingListIdsSchema(Schema):
    # id = Integer()
    advertising_ids = List(String(), required=True)
