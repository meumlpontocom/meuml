
from marshmallow.fields import List, String
from marshmallow.schema import Schema
from marshmallow.validate import Length


class PhoneSchema(Schema):
    class Meta:
        strict = True

    country_code = String(
        validate=Length(min=1),
        required=True,
        error_messages={
            'required' : "O campo 'código do país' é obrigatório"
        }
    )

    area_code = String(
        required=False,
        error_messages={
            'required' : "O campo 'código de área' é obrigatório"
        },
        allow_none=True,
        default=None,
        missing=None
    )

    phone_number = String(
        validate=Length(min=1),
        required=True,
        error_messages={
            'required' : "O campo 'número do celular' é obrigatório"
        }
    )

    topics = List(
        String,
        validate=Length(
            min=1,
            error='Ao menos um tópico deve ser selecionado'
        ),
        many=True,
        required=True
    )
