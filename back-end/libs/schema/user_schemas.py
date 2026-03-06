from marshmallow import validates_schema, ValidationError
from marshmallow.fields import String, Email, Integer, DateTime
from marshmallow.schema import Schema

class UsersSchema(Schema):
    class Meta:
        type_ = 'users'

    id = Integer()
    date_created = DateTime()
    date_modified = DateTime()
    seller_id = Integer()
    confirmed_at = DateTime()
    status = String()
    email = String()
    name = String()

class ConfirmEmailSchema(Schema):
    class Meta:
        pass

    email = String()
    hash = String()


class UserRegisterSchema(Schema):
    class Meta:
        pass

    # user fields
    email = Email(
        required=True,
        error_messages={
            'required' : "O campo 'email' é obrigatório",
            'invalid' : "O campo 'email' precisa possuir um e-mail válido"
        }
    )

    name = String(
        required=True,
        error_messages={
            'required' : "O campo 'name' é obrigatório"
        }
    )
    password = String(
        required=True,

        error_messages={
            'required' : "O campo 'password' é obrigatório"
        }
    )


    @validates_schema
    def validate_password(self, data, **kwargs):
        if data['password'] == '' :
            raise ValidationError("O campo 'password' não pode estar em branco")
        elif len(data['password']) < 6:
            raise ValidationError("O campo 'password' precisa possuir mais de 6 caracteres")

class UpdateUserNameSchema(Schema):
    class Meta:
        pass

    # user fields
    name = String(
        required=True,
        error_messages={
            'required' : "O campo 'name' é obrigatório",
            'invalid' : "O campo 'name' é do tipo string"
        }
    )



class UpdatePasswordSchema(Schema):
    class Meta:
        pass

    # user fields
    hash = String(
        required=True,
        error_messages={
            'required' : "O campo 'hash' é obrigatório",
            'invalid' : "O campo 'hash' é do tipo string"
        }
    )

    email = Email(
        required=True,
        error_messages={
            'required' : "O campo 'email' é obrigatório",
            'invalid' : "O campo 'email' precisa possuir um e-mail válido"
        }
    )

    password = String(
        required=True,
        error_messages={
            'required' : "O campo 'password' é obrigatório",
            'invalid' : "O campo 'password' é do tipo string"
        }
    )

    password2 = String(
        required=True,
        error_messages={
            'required' : "O campo 'password2' é obrigatório",
            'invalid' : "O campo 'password2' é ser do tipo string"
        }
    )



    @validates_schema
    def validate_numbers(self, data, **kwargs):
        if data['password'] != data['password2']:
            raise ValidationError("Os campos 'password' e 'password2' precisam ser iguais")

        if len(data['password']) < 6:
            raise ValidationError("O campo 'password' precisa ter do que 6 caracteres")

class ResendEmailSchema(Schema):
    class Meta:
        pass

    email = String()
