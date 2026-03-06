
from marshmallow.fields import String, Integer, DateTime, Boolean
from marshmallow.schema import Schema
from marshmallow.validate import Length
from marshmallow import validates_schema, ValidationError


class FaqSchema(Schema):
    class Meta:
        strict = True

    hide_question = Boolean(
        required=False,
        default=False,
        missing=False,
    )

    position = Integer(
        required=False,
        allow_none=None,
        missing=None
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
        missing=None
    )

    video_url = String(
        required=False,
        allow_none=None,
        missing=None
    )

    tag = String(
        required=True,
        error_messages={
            'required': "O campo 'tag' de atributo é obrigatório"
        }
    )
