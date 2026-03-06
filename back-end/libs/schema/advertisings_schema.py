from marshmallow.fields import String, Integer, Nested, DateTime, Number, Boolean, Dict, List, Float, Nested
from marshmallow.schema import Schema as Schema2
from marshmallow import validates_schema, ValidationError
from marshmallow_jsonapi.flask import Schema, Relationship
from marshmallow.validate import Length


class AdvertisingUpdatePriceSchema(Schema):

    class Meta:
        type_ = 'advertising'
    account_id = Integer(required=True)
    #advertisings_id = List(required=True)
    price_premium = Float(required=True)
    price_classic = Float(required=True)
    price_free = Float(required=True)


class NewMshopsAdvertisingSchema(Schema):
    class Meta:
        type_ = 'advertising'

    id = Integer()
    create_classic_advertising = Boolean(required=True)
    account_id = Integer(required=True)

    title = String(required=True)
    category_id = String(required=True)
    catalog_id = String(dump_default=None, allow_none=True)
    price = Number(dump_default=None, allow_none=True)
    mshops_price = Number(dump_default=None, allow_none=True)
    condition = String(required=True)
    # new, used, not_specified
    listing_type_id = String(required=True)
    # free, gold_pro, gold_special
    available_quantity = Integer(required=True)
    # 1 se listing_type_id = free
    pictures = List(String(), required=True)
    # ["805951-MLB41715820941_052020"]
    video_id = String(dump_default=None, allow_none=True)
    immediate_payment = Boolean(dump_default=False, allow_none=True)
    description = String(dump_default=None, allow_none=True)
    attributes = List(Dict(), allow_none=True)
    # variations = List(Dict(), allow_none=True)
    channels = List(String(), required=True)
    sale_terms = List(Dict(), allow_none=True)
    shipping = Dict(dump_default=None, allow_none=True)
    domain_id = String(required=False, allow_none=True)


class MshopAdvertisingUpdateSchema(Schema):
    class Meta:
        type_ = 'advertising_update'

    id = String()
    available_quantity = Integer(dump_default=None, required=False, allow_none=True)
    price = Float(dump_default=None, required=False, allow_none=True)
    video_id = String(dump_default=None, required=False, allow_none=True)
    pictures = List(Dict(), dump_default=None, required=False, allow_none=True)
    description = Dict(dump_default=None, required=False, allow_none=True)
    status = String(dump_default=None, required=False, allow_none=True)
    sale_terms = List(Dict(), dump_default=None, required=False, allow_none=True)
    title = String(dump_default=None, required=False, allow_none=True)
    category_id = String(dump_default=None, required=False, allow_none=True)
    shipping = Dict(dump_default=None, required=False, allow_none=True)
    condition = String(dump_default=None, required=False, allow_none=True)
    attributes = List(Dict(), dump_default=None, required=False, allow_none=True)
    #variations = List(Dict(), dump_default=None, required=False, allow_none=True)
    listing_type_id = String(dump_default=None, required=False, allow_none=True)


class NewAdvertisingSchema(Schema):
    class Meta:
        type_ = 'advertising'

    id = Integer()
    create_classic_advertising = Boolean(required=True)
    create_catalog_advertising = Boolean(required=True)
    account_id = List(Integer(), required=True)

    title = String(required=True)
    category_id = String(required=True)
    catalog_id = String(dump_default=None, allow_none=True)
    price = Number(dump_default=None, allow_none=True)
    condition = String(required=True)
    # new, used, not_specified
    listing_type_id = String(required=True)
    # free, gold_pro, gold_special
    available_quantity = Integer(required=True)
    # 1 se listing_type_id = free
    pictures = List(String(), required=True)
    # ["805951-MLB41715820941_052020"]
    video_id = String(dump_default=None, allow_none=True)
    immediate_payment = Boolean(dump_default=False, allow_none=True)
    description = String(dump_default=None, allow_none=True)
    attributes = List(Dict(), allow_none=True)
    variations = List(Dict(), allow_none=True)
    sale_terms = List(Dict(), allow_none=True)
    shipping = Dict(dump_default=None, allow_none=True)
    domain_id = String(required=False, allow_none=True)
    evaluate_eligibility = Boolean(dump_default=False, allow_none=False)


class DuplicateAdvertisingListSchema(Schema):
    class Meta:
        type_ = 'advertising_duplicate'

    id = String(required=True)
    account_id = List(Integer(), required=True)

    attributes = List(Dict(), allow_none=True)
    available_quantity = Integer(required=True)
    buying_mode = String(required=True)
    category_id = String(required=True)
    condition = String(required=True)
    listing_type_id = String(required=True)
    price = Number(dump_default=None, allow_none=True)
    title = String(required=True)

    # pictures = List(String(), required=True)
    # video_id = String(dump_default=None, allow_none=True)
    # description = String(dump_default=None, allow_none=True)
    # variations = List(Dict(), allow_none=True)
    # sale_terms = List(Dict(), allow_none=True)
    # shipping = Dict(dump_default=None, allow_none=True)


class AdvertisingListSchema(Schema):
    class Meta:
        type_ = 'duplicate_advertising_list'

    id = Integer()
    allow_duplicated_account = Boolean(
        dump_default=False, required=False, load_default=False)
    allow_duplicated_title = Boolean(
        dump_default=False, required=False, load_default=False)
    allow_copying_warranty = Boolean(
        dump_default=False, required=False, load_default=False)
    account_id = List(Integer(), required=True)
    advertisings = List(Dict(), required=True)
    mass_override = Dict(dump_default=None, allow_none=True)
    replication_mode = String(required=False, load_default='standard')
    selectedOfficialStore = Dict(dump_default={}, allow_none=True)


class AdvertisingListShopeeSchema(Schema2):
    class Meta:
        pass

    accounts_id = List(Integer(), required=True)
    advertisings = List(Dict(), required=True)
    variations_amount = Integer(dump_default=None, required=False, allow_none=True)


class AdvertisingHighQualityPropertiesSchema(Schema):
    class Meta:
        type_ = 'advertising_high_quality_properties'

    id = String()
    title = String(required=True)
    description = Dict(dump_default=None, required=True)
    pictures = List(Dict(), required=True)
    attributes = List(Dict(), required=True)
    category_id = String(required=True)
    site_id = String(required=True)
    domain_id = String(required=True)


class AdvertisingUpdateSchema(Schema):
    class Meta:
        type_ = 'advertising_update'

    id = String()
    available_quantity = Integer(dump_default=None, required=False, allow_none=True)
    price = Float(dump_default=None, required=False, allow_none=True)
    video_id = String(dump_default=None, required=False, allow_none=True)
    pictures = List(Dict(), dump_default=None, required=False, allow_none=True)
    description = Dict(dump_default=None, required=False, allow_none=True)
    status = String(dump_default=None, required=False, allow_none=True)
    sale_terms = List(Dict(), dump_default=None, required=False, allow_none=True)
    title = String(dump_default=None, required=False, allow_none=True)
    category_id = String(dump_default=None, required=False, allow_none=True)
    shipping = Dict(dump_default=None, required=False, allow_none=True)
    condition = String(dump_default=None, required=False, allow_none=True)
    attributes = List(Dict(), dump_default=None, required=False, allow_none=True)
    variations = List(Dict(), dump_default=None, required=False, allow_none=True)
    listing_type_id = String(dump_default=None, required=False, allow_none=True)


class AlterSKUSchema(Schema2):
    class Meta:
        pass

    advertisings_id = List(
        String(),
        many=True,
        required=True
    )

    sku = String(
        required=True,
        validate=Length(min=1),
        error_messages={
            'required': "O campo 'SKU' é obrigatório"
        }
    )

    variations_sku = Dict(dump_default=None, allow_none=True)


class AdvertisingListIdsSchema(Schema):
    # id = Integer()
    advertising_ids = List(String(), required=True)
