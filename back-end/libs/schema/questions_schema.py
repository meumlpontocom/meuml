from marshmallow.fields import String, Integer, Nested, DateTime
from marshmallow.schema import Schema
from marshmallow import validates_schema, ValidationError


from marshmallow.schema import Schema
from marshmallow.fields import Integer, String


class BlockUserSchema(Schema):
    class Meta:
        pass

    account_id = Integer(required=True)
    user_id = String(required=True)
    item_id = String(required=False)



class QuestionAnswerSchema(Schema):
    class Meta:
        pass

    account_id = String(required=True)
    question_id = String(required=True)
    text = String(required=True)


