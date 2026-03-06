
from marshmallow.fields import String, Email
from marshmallow.schema import Schema



class LoginSchema(Schema):
    class Meta:
        strict = True

    email = String(
        required=True,
        error_messages={
            'required' : "O campo 'email' é obrigatório",
            'invalid' : "O campo 'email' precisa possuir um e-mail válido"
        }
    )

    password = String(
        required=True,
        error_messages={
            'required' : "O campo 'password' é obrigatório"
        }
    )

class EmailSchema(Schema):

    class Meta:
        strict = True

    email = Email(
        required=True,
        error_messages={
            'required':"O campo 'email' é obrigatório",
            'invalid':"O campo 'email' precisa possuir um e-mail válido"
        }
    )



class ConfirmEmailSchema(Schema):
    class Meta:
        strict = True

    email = Email(
        required=True,
        error_messages={
            'required' : "O campo 'email' é obrigatório",
            'invalid' : "O campo 'email' precisa possuir um e-mail válido"
        }
    )

    hash = String(
        required=True,
        error_messages={
            'required' : "O campo 'hash' é obrigatório"
        }
    )


class ResetPasswordSchema(Schema):
    class Meta:
        strict = True

    # user fields
    email = String(
        required=True,
        error_messages={
            'required' : "O campo 'email' é obrigatório",
            'invalid' : "O campo 'email' precisa possuir um e-mail válido"
        }
    )


class SaveDeviceToken(Schema):
    class Meta:
        strict = True

    # user fields
    token = String(
        required=True,
        error_messages={
            'required' : "O campo 'token' é obrigatório",
            'invalid' : "O campo 'token' precisa possuir um token válido"
        }
    )

