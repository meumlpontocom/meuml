from marshmallow.fields import String, Integer, Nested, DateTime
from marshmallow.schema import Schema
from marshmallow import validates_schema, ValidationError



class UpdateAccountName(Schema):
    class Meta:
        strict = True

    # user fields
    name = String(
        required=True,
        error_messages={
            'required' : "O campo 'name' é obrigatório",
            'invalid' : "O campo 'name' é do tipo string"
        }
    )



class SellerSchema(Schema):
    class Meta:
        type_ = 'sellers'
        strict = True

    id = Integer(required=True)
    date_created = DateTime(required=True)


class AccountSchema(Schema):
    class Meta:
        strict = True

    id = Integer()
    external_id = String()
    external_name = String()
    external_data = String()
    name = String()
    seller = Nested("SellerSchema")


class SyncSchema(Schema):
    class Meta:
        strict = True

    code = String(required=True)


class OAuthSchema(Schema):
    class Meta:
        strict = True

    code = String(required=True)

    @validates_schema
    def validate_code(self, data):
        if data['code'] == '' :
            raise ValidationError('O campo {code} não pode estar vazio')