import datetime
import inspect

def default(val):
    pass

def value(val, type):
    return type(val) == type

class Type:
    value = '__FALSE__|!'
    default = '__FALSE__|!'
    not_null = True

    class Meta:
        pass

    def __init__(self, default='__FALSE__|!', not_null: bool = True, value: str = '__FALSE__|!', field: str = ''):
        self.default = default
        self.not_null = not_null
        self.value = value
        self.field = {}
        self.field['field'] = field

    def equals(cls, value):
        cls.field['query'] = f'{cls.field["field"]} = :{cls.field["field"]}'
        return cls.field, value


    def andEquals(cls, value):
        cls.field['query'] = f'AND {cls.field["field"]} = :{cls.field["field"]}'
        return cls.field, value

    def orEquals(cls, value):
        cls.field['query'] = f'OR {cls.field["field"]} = :{cls.field["field"]}'
        return cls.field, value

    def typeof(self, value):
        return type(value) == self.type

    def is_not_null(self):
        return self.not_null == True

    def has_default_value(self):
        return self.default != '__FALSE__|!'

    def get_default(self):
        return self.default

    def set_value(self, value):
        self.value = value

    def __call__(self, *args, **kwargs):

        print(self.field)

        if len(args) > 0:
            if len(args) == 1:
                value = args[0]
                return self.__class__.typeof(self, value)
            elif len(args) > 1:
                condition = args[0]
                value = args[1]
                self.condition = condition
                self.value =  value
                return self
        else:
            return self.value

    def __str__(self):
        return str(self.value)

    def __int__(self):
        if type(self.value) == int:
            return self.value


    '''def __str__(self):
        attributes = inspect.getmembers(self, lambda a:not(inspect.isroutine(a)))
        attributes:list = [a for a in attributes if not(a[0].startswith('__') and a[0].endswith('__'))]
        print(attributes)
        return self'''

class Integer(Type):
    type = int
    pass

class Date(Type):
    type = datetime.datetime
    pass

class Char(Type):
    type = str
    pass

class Varchar(Type):
    type = str
    pass

class Varchar2(Type):
    type = str
    pass

class Number(Type):
    type = float
    pass

class Boolean(Type):
    type = bool
    pass

class Clob(Type):
    type = str

class Float(Type):
    type = float

