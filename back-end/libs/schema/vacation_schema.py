
from marshmallow.fields import List, String, Integer, DateTime, Boolean
from marshmallow.schema import Schema


class ActivateVacationSchema(Schema):
    # account_id = List(
    #     Integer(),
    #     required=True,
    #     error_messages={
    #         'required' : "O campo 'contas' é obrigatório",
    #         'invalid' : "O campo 'contas' precisa possuir ao menos uma conta válida"
    #     }
    # )

    vacation_type = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'tipo' é obrigatório"
        }
    )

    starts_at = DateTime(format='%Y-%m-%d %H:%M', required=False, allow_none=True)
    ends_at = DateTime(format='%Y-%m-%d %H:%M', required=False, allow_none=True)
    pause_full = Boolean(default=False, missing=False, allow_none=True)
