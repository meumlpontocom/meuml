from marshmallow.fields import String, Integer, Boolean, List, Dict
from marshmallow.schema import Schema
from marshmallow import validates_schema, ValidationError

class BlacklistAddCustomerSchema(Schema):

    list_name = String(required=True)
    customers = List(Integer(), required=True)
    list_import = Boolean(required=False)
    accounts = List(Integer(), required=False)
    questions = Boolean(required=False)
    bids = Boolean(required=False)


class BlacklistListFromBlockSchema(Schema):
    class Meta:
        pass
    id = Integer()
    name = String()

    block_id = Integer(
        required=True,
        error_messages={
            'required': "O campo 'block_id' é obrigatório",
            'invalid': "O campo 'block_id' precisa ser do tipo Integer"
        }
    )

    list_name = String(
        required=True,
        error_messages={
            'required': "O campo 'list_name' é obrigatório",
            'invalid': "O campo 'list_name' precisa ser do tipo String"
        }
    )

    list_description = String(
        required=True,
        error_messages={
            'required': "O campo 'list_description' é obrigatório",
            'invalid': "O campo 'list_description' precisa ser do tipo String"
        }
    )

    bids = Boolean(
        required=True,
        error_messages={
            'required': "O campo 'bids' é obrigatório",
            'invalid': "O campo 'bids' precisa ser do tipo Boolean"
        }
    )

    questions = Boolean(
        required=True,
        error_messages={
            'required': "O campo 'questions' é obrigatório",
            'invalid': "O campo 'questions' precisa ser do tipo Boolean"
        }
    )

    @validates_schema
    def validate_code(self, data, **kwargs):
        if data['questions'] is False and data['bids'] is False:
            raise ValidationError('Informe pelo menos um regra para bloquear (bids ou questions).')


class BlacklistListDeleteSchema(Schema):
    class Meta:
        pass

    blacklist_id = Integer(
        required=True,
        error_messages={
            'required': "O campo 'block_id' é obrigatório",
            'invalid': "O campo 'block_id' precisa ser do tipo Integer"
        }
    )


class BlacklistUnblockSchema(Schema):
    class Meta:
        pass

    block_id = Integer(
        required=True,
        error_messages={
            'required': "O campo 'block_id' é obrigatório",
            'invalid': "O campo 'block_id' precisa ser do tipo Integer"
        }
    )
    bids = Boolean(
        required=True,
        error_messages={
            'required': "O campo 'bids' é obrigatório",
            'invalid': "O campo 'bids' precisa ser do tipo Boolean"
        }
    )

    questions = Boolean(
        required=True,
        error_messages={
            'required': "O campo 'questions' é obrigatório",
            'invalid': "O campo 'questions' precisa ser do tipo Boolean"
        }
    )

    @validates_schema
    def validate_code(self, data, **kwargs):
        if data['questions'] is False and  data['bids'] is False:
            raise ValidationError('Informe pelo menos um regra para desbloquear (bids ou questions).')

class BlacklistListShareSchema(Schema):
    class Meta:
        pass

    #account_id = Integer(required=True)
    blacklist_name = String(required=True)
    accounts = List(Integer(), required=True)
    questions = Boolean(required=True)
    bids = Boolean(required=True)


class BlacklistBlockCommentSchema(Schema):
    class Meta:
        type_ = 'blacklist_block_comment'

    id = Integer(as_string=True)
    description = String(required=True)

class BlacklistNewMotiveSchema(Schema):

    description = String(required=True)
    name = String(required=True)


class BlacklistMotivesSchema(Schema):
    class Meta:
        type_ = 'blacklist_motives'

    id = Integer()
    description = String()
    name = String()
    key = Integer()


class BlacklistListBlockSchema(Schema):
    class Meta:
        pass

    list_name = String(
        required=True,
        error_messages={
            'required': "O campo 'list_name' é obrigatório",
            'invalid': "O campo 'list_name' precisa ser do tipo Integer"
        }
    )

    list_description = String(
        required=True,
        error_messages={
            'required': "O campo 'list_description ' é obrigatório",
            'invalid': "O campo 'list_description ' precisa ser do tipo Integer"
        }
    )

class BlacklistBlockSchema(Schema):
    class Meta:
        pass

    account_id = Integer(
        required=True,
        error_messages = {
            'required': "O campo 'account_id' é obrigatório",
            'invalid': "O campo 'account_id' precisa ser do tipo Integer"
        }
    )

    customer_id = String(
        required=True,
        error_messages = {
            'required': "O campo 'customer_id' é obrigatório",
            'invalid': "O campo 'customer_id' precisa ser do tipo String"
        }
    )

    bids = Boolean(
        required=True,
        error_messages = {
            'required': "O campo 'bids' é obrigatório",
            'invalid': "O campo 'bids' precisa ser do tipo Boolean"
        }
    )

    questions = Boolean(
        required=True,
        error_messages = {
            'required': "O campo 'questions' é obrigatóriaao",
            'invalid': "O campo 'questions' precisa ser do tipo Boolean"
        }
    )

    motive_id = Integer(
        allow_none=True,
        required=True,
        error_messages = {
            'required': "O campo 'motive_id' é obrigatório",
            'invalid': "O campo 'motive_id' precisa ser do tipo Integer",
            'allow_none': "O campo 'motive_id' não pode ser Null"
        }
    )

    motive_description = String(
        error_messages = {
            'invalid': "O campo 'motive_description' precisa possuir um e-mail válido"
        }
    )
