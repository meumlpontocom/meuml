

class ActionsException(Exception):
    pass

class ModelException(Exception):
    pass

class UsersException(Exception):
    pass

class UsersActionsException(Exception):
    pass

class AccountsActionsException(Exception):
    pass

class TypesException(Exception):
    pass

class QueryBuilderException(Exception):
    pass

class DatabaseException(Exception):
    pass

class ItemNotFound(DatabaseException):
    pass


class ItemNotInserted(DatabaseException):
    pass

class ConnectError(DatabaseException):
    pass

class MailException(Exception):
    pass

class OAuth2Exception(Exception):
    pass

class ShopeeConnectionException(Exception):
    def __init__(self, message="Erro ao se comunicar com Shopee"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f'{self.message}'

class WaApiConnectionException(Exception):
    def __init__(self, message="Erro ao se comunicar com WaApi ZapIntegrado"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f'{self.message}'