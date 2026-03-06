import json
import inspect
from libs.database.types import Type
from libs.database.query_builder import QueryBuilder
from libs.exceptions.exceptions import ItemNotFound, ItemNotInserted

'''
    Classe responsável pela conexão com o banco de dados
    
    Toda estrutura de conexão está comprometida, existe um bug que não permite o funcionamento correto com multiplas conexões
'''
class Model(QueryBuilder):

    __tablename__ = None

    def __init__(self, action = None, __connection__ = None, __cursor__ = None, **kwargs):
        self.__conn__ = __connection__
        self.__cursor__ = __cursor__
        self.__commit__ = True
        errors: list = []

        attributes = inspect.getmembers(self, lambda a:not(inspect.isroutine(a)))
        self.attributes:list = [a for a in attributes if not(a[0].startswith('__') and a[0].endswith('__'))]
        attrs: dict = {}

        for attr in self.attributes:
            attrs[attr[0]] = attr[1]

        for arg in kwargs:
            value = kwargs[arg]
            type_arg = attrs[arg]

            if not type_arg(value):
                errors.append(f'Field {arg} is with invalid type: {type(value)}, it only accepts: {type(type_arg)}')
            else:
                type_arg.value = value

        self.attributes = attrs

        if len(errors) > 0:
            raise Exception(errors)


    def select(self, *kwargs, fields = []): # ,fields: list = [], conditions: list = []):
        args = {}

        for arg in kwargs:
            args[arg[0]['field']] = arg

        self.__commit__ = False

        self.select_query(self.__class__.__name__, fields=fields, dict_fields=args)

        return self

    def one(self):

        data = self.__cursor__.fetchone()

        if data is None:
            return None

        column_names = list(map(lambda x: x.lower(), [
            d[0] for d in self.__cursor__.description]))
        # list of data items
        data = dict(zip(column_names, data))

        if self.__error__ is not None:
            raise Exception(self.__error__.args[0]['error_text'])
        if type(data) == list:
            obj_items: list = []
            for item in data:
                obj = self.__class__
                for attr in item:
                    if attr == 'id_value':
                        setattr(obj, 'id', str(item[attr]).rstrip('.0'))
                    else:
                        setattr(obj, attr, item[attr])
                obj_items.append(obj)
            return obj_items
        else:
            for attr in data:
                if attr == 'id_value':
                    setattr(self, 'id', str(data[attr]).rstrip('.0'))
                else:
                    setattr(self, attr, data[attr])
            self.data = data
            return self

    def save(self):

        query_fields: list = []
        query_values: list = []

        attributes = inspect.getmembers(self, lambda a: not (inspect.isroutine(a)))
        attributes: list = [a for a in attributes if not (a[0].startswith('__') and a[0].endswith('__'))]

        if 'access_token' not in attributes[0]:
            del attributes[0]

        def get_attrs(attr):
            print(attr)

        for attr in attributes:
            name = attr[0]
            print(name)
            type_inst = attr[1]
            #print(name)

            if name == 'id' or name == 'attributes':
                continue

            if name == 'status':
                print(type_inst)
            if isinstance(type_inst, Type):

                if type_inst.value == '__FALSE__|!':
                    if type_inst.has_default_value():
                        query_values.append(type_inst.default)
                        query_fields.append(name)
                else:
                    if type_inst.value not in [None, ''] and type_inst.is_not_null():
                        query_values.append(type_inst)
                        query_fields.append(name)
                    else:
                        if type_inst.value in [None, ''] and type_inst.has_default_value():
                            query_values.append(type_inst.default)
                            query_fields.append(name)
                        else:
                            query_values.append(type_inst)
                            query_fields.append(name)

            else:
                query_values.append(type_inst)
                query_fields.append(name)

        print(query_values)
        print(query_fields)
        print(query_values)
        #try:

        self.insert(self.__tablename__, query_fields, query_values)
        #except Exception as e :
        #    print(e.args)

        if self.__error__ is not None:
            print(self.__error__)
            raise ItemNotInserted(self.__error__.args[0]['error_text'])

        return self

    '''
    OLD
    '''
    def aselect(cls, fields: dict = {}, conditions: dict = {}):

        cls.__commit__ = False

        query_fields: list = []
        query_values: list = []

        for attr in cls.attributes:
            type_inst: Type = cls.attributes[attr]

            if type_inst.value is not None and type_inst.is_not_null():
                query_values.append(cls.attributes[attr])
                query_fields.append(attr)
            else:
                if type_inst.has_default_value():
                    query_values.append(cls.attributes[attr])
                    query_fields.append(attr)
                else:
                    pass

        data = cls.select_query(cls.__tablename__, conditions=conditions, fields=fields)

        if self.__error__ is not None:
            raise Exception(self.__error__.args[0]['error_text'])

        for attr in data:
            if attr == 'id_value':
                setattr(cls, 'id', str(data[attr]).rstrip('.0'))
            else:
                setattr(cls, attr, data[attr])

        return cls


    def find(cls, id: int):
        cls.__commit__ = True

        query_fields: list = []
        query_values: list = []

        for attr in cls.attributes:
            type_inst: Type = cls.attributes[attr]

            if type_inst.value is not None and type_inst.is_not_null():
                query_values.append(cls.attributes[attr])
                query_fields.append(attr)
            else:
                if type_inst.has_default_value():
                    query_values.append(cls.attributes[attr])
                    query_fields.append(attr)
                else:
                    pass
        data = cls.select_one(cls.__tablename__, fields=query_fields, index=id)

        if self.__error__ is not None:
            raise Exception(self.__error__.args[0]['error_text'])

        for attr in data:
            if attr == 'id_value':
                setattr(cls, 'id', str(data[attr]).rstrip('.0'))
            else:
                setattr(cls, attr, data[attr])

        return cls


    def update(self, values: dict = {}):

        query_fields: list = []
        query_values: list = []

        for attr in self.attributes:

            if attr in ['id','date_created']:
                continue

            type_inst: Type = self.attributes[attr]

            if attr in values:
                query_fields.append(attr)
                query_values.append(values[attr])
            else:
                if type_inst.value is not None and type_inst.is_not_null():
                    query_fields.append(attr)
                    query_values.append(self.attributes[attr])
                else:
                    if type_inst.has_default_value():
                        query_fields.append(attr)
                        query_values.append(self.attributes[attr])
                    else:
                        pass

        data = self.update_item(self.__tablename__, self.id, query_fields, query_values)

        if self.__error__ is not None:
            raise Exception(self.__error__.args[0]['error_text'])

        for attr in data:
            if attr == 'id_value':
                setattr(self, 'id', str(data[attr]).rstrip('.0'))
            else:
                setattr(self, attr, data[attr])
        return self

    def delete(self, id):
        data = self.delete_item(self.__tablename__, id)

        for attr in data:
            if attr == 'id_value':
                setattr(self, 'id', str(data[attr]).rstrip('.0'))
            else:
                setattr(self, attr, data[attr])

        return self

    #def __repr__(self):
    #    if type(self.id) == int:
    #        return f'<{self.__class__.__name__} id={self.id}>'
    #    print('asdasdsad')
    #    return str(self.__error__)

