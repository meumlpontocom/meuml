
from marshmallow.fields import String, Integer, DateTime, Boolean
from marshmallow.schema import Schema
from marshmallow.validate import Length
from marshmallow import validates_schema, ValidationError


class FaqSchema(Schema):
    class Meta:
        pass

    hide_question = Boolean(
        required=False,
        dump_default=False,
        load_default=False,
    )

    position = Integer(
        required=False,
        allow_none=None,
        load_default=None
    )

    question = String(
        required=True,
        error_messages={
            'required': "O campo 'pergunta' de atributo é obrigatório"
        }
    )

    answer = String(
        required=False,
        allow_none=None,
        load_default=None
    )

    video_url = String(
        required=False,
        allow_none=None,
        load_default=None
    )

    tag = String(
        required=True,
        error_messages={
            'required': "O campo 'tag' de atributo é obrigatório"
        }
    )
