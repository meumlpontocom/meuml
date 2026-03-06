
from marshmallow.fields import Boolean, Float
from marshmallow.schema import Schema
from marshmallow.validate import Length
from marshmallow import validates_schema, ValidationError


class PriceToWinConditionsSchema(Schema):
    class Meta:
        pass

    price = Float(
        required=True,
        allow_none=True,
        error_messages={
            'required' : "O campo 'preço' é obrigatório"
        }
    )

    no_interest = Boolean(
        required=True,
        error_messages={
            'required' : "O campo 'oferta sem juros' é obrigatório"
        }
    )

    free_shipping = Boolean(
        required=True,
        error_messages={
            'required' : "O campo 'frete grátis' é obrigatório"
        }
    )

    @validates_schema
    def validate_numbers(self, data, **kwargs):
        conditions_count = 0
        for value in data.values():
            if value:
                conditions_count += 1
        if conditions_count == 0:
            raise ValidationError("Ao menos uma condição deve ser alterada")

