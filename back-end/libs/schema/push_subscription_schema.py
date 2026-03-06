
from marshmallow.fields import String, Nested, Dict, Integer
from marshmallow.schema import Schema
from marshmallow.validate import Length


class KeysSchema(Schema):
    class Meta:
        strict = True

    p256dh = String(
        validate=Length(min=1),
        required=True,
        error_messages={
            'required' : "O campo 'keys.p256dh' é obrigatório"
        }
    )

    auth = String(
        validate=Length(min=1),
        required=True,
        error_messages={
            'required' : "O campo 'keys.auth' é obrigatório"
        }
    )


class SubscribeSchema(Schema):
    class Meta:
        strict = True

    endpoint = String(
        validate=Length(min=1),
        required=True,
        error_messages={
            'required' : "O campo 'endpoint' é obrigatório"
        }
    )

    keys = Dict(
        Nested(KeysSchema),
        required=True
    )

class SendExpoNotificationSchema(Schema):
    class Meta:
        strict = True
        
    user_id = Integer(
        required=True,
        error_messages={
            'required': "O campo 'user_id' é obrigatório",
            'invalid': "O campo 'user_id' deve ser um número inteiro válido."
        }
    )
    
    title = String(
        required=True,
        error_messages={
            'required': "O campo 'title' é obrigatório",
            'invalid': "O campo 'title' deve ser uma string válida."
        }
    )
    
    body = String(
        required=True,
        error_messages={
            'required': "O campo 'body' é obrigatório",
            'invalid': "O campo 'body' deve ser uma string válida."
        }
    )
