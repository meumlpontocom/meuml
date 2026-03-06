from enum import IntEnum

class Marketplace(IntEnum):
    MercadoLibre = 1
    Shopee = 2
    VendaPessoal = 3
    LojaPropria = 4

    @staticmethod
    def getNameByValue(key):
        for item in Marketplace:
            if item.value == key:
                return item.name
        return None
