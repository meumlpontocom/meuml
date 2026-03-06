
class Promotions():
    types = {
        'DEAL': 1,
        'MARKETPLACE_CAMPAIGN': 2,
        'DOD': 3,
        'LIGHTNING': 4,
        'PRICE_DISCOUNT': 5,
        'VOLUME': 6,
        'PRE_NEGOTIATED': 7
    }

    database_rows = [
        {
            "id" : 1,
            "key" : "DEAL",
            "name" : "Campanhas tradicionais"
        },
        {
            "id" : 2,
            "key" : "MARKETPLACE_CAMPAIGN",
            "name" : "Campanhas com participação"
        },
        {
            "id" : 3,
            "key" : "DOD",
            "name" : "Oferta do dia"
        },
        {
            "id" : 4,
            "key" : "LIGHTNING",
            "name" : "Oferta relâmpago"
        },
        {
            "id" : 5,
            "key" : "PRICE_DISCOUNT",
            "name" : "Descontos individuais"
        },
        {
            "id" : 6,
            "key" : "VOLUME",
            "name" : "Desconto por volume"
        },
        {
            "id" : 7,
            "key" : "PRE_NEGOTIATED",
            "name" : "Desconto pré-acordado por item"
        }
    ]
