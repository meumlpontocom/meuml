

class BaseException(Exception):

    def __init__(self, message: str = 'Erro sem mensagem definida', code: int = 0, line: int = 0, errors: list = []):

        super(BaseException, self).__init__(message)

        self.message = message
        self.code = code
        self.line = line
        self.errors = errors

    def __str__(self):
        print(f'ERRO[{self.code}] MESSAGE[{self.message}] - LINE[{self.line}]')
