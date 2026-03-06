import re
# import cx_Oracle
#from libs.database.connector import execute, column_names, fetch_data, fetch_one
from libs.database.types import Type

class QueryBuilder(object):

    __cursor__: None #cx_Oracle.connect
    __commit__: bool
    __conn__: None #cx_Oracle.Cursor
    __data__: []

    def execute(self, query: str = '', values: dict = {}):

        try:
            if values:
                self.__cursor__.execute(query, values)
            else:
                self.__cursor__.execute(query)

            if self.__commit__:
                self.__conn__.commit()

            # if isinstance(self.id, cx_Oracle.NUMBER):
            #     self.id: cx_Oracle.NUMBER = self.id.getvalue()

            if self.id is not None and not isinstance(self.id, Type):
                self.id = int(str(self.id[0]).rstrip('.0'))

        # except cx_Oracle.DatabaseError as e:
        #     self.__conn__.rollback()
        #     search = re.search(r'ORA-(.*?):', str(e))

        #     error_code = str(search.group(1)) if search is not None else 'Erro não identificado'

        #     error_text = str(e).replace(f'ORA-{error_code}: ', '')

        #     self.__conn__.rollback()

        #     raise Exception({"error_text":error_text,"error_code":error_code})

        except Exception as e:
            print(e)
            raise Exception({"error_text":"erro não identificado"})

    def select_query(self, table: str = '', fields: list = [], dict_fields: dict = {}):

        table: str = table.lower()

        if len(fields) > 0 and dict_fields is False:
            fields_str = ','.join([field.field for field in fields])
        else:
            fields_str = '*'

        query = f'SELECT {fields_str} FROM meuml.{table}'

        values_fields: {} = {}
        if not dict_fields:
            query += self.set_conditions(conditions=fields)
        else:
            query += ' WHERE '
            c = 0
            for field in dict_fields:
                values_fields[field] = dict_fields[field][1]
                val_field = dict_fields[field][0]["query"]
                query += f'{val_field}'
                if c < len(dict_fields) - 1:
                    query += ', '#' AND '
                c += 1

        try:
            if not dict_fields:
                self.execute(query=query)
            else:
                self.execute(query=query, values=values_fields)
        except Exception as e:
            self.__error__ = str(e)
            print(self.__error__)


    def concat_fields_str(self, fields: list = []):
        return ', '.join(f'{field}' for field in fields)

    def set_conditions(self, conditions: list = []):
        query = ''

        conditions_lst: list = []
        if conditions:
            c = 0

            for condition in conditions:
                if condition.condition in ['=','>','<','>=','<=']:
                    if type(condition.value) == str:
                        conditions_lst.append(f' {condition.field} {condition.condition} \'{condition.value}\'')
                    else:
                        conditions_lst.append(f' {condition.field} {condition.condition} {condition.value}')

                if len(conditions) < c -1:
                    conditions_lst[c] += ','
                c += 1

            query += ' WHERE '

            conditions_str: str = ', '.join(condition for condition in conditions_lst)
            query += conditions_str

        return query


    def concat_values_str(self, values: list = []):
        return ', '.join(':' + str(var) for var in values)

    def prepare_dict_values(self, fields: list = [], values: list = [], index = 0): #cx_Oracle.NUMBER = 0):
        dict_values: dict = {}

        c = 0
        for field in fields:
            if isinstance(values[c], Type):
                dict_values[field] = values[c].value
            else:
                dict_values[field] = values[c]
            c += 1

        # if type(index) == cx_Oracle.NUMBER:
        #     dict_values['id_value'] = index

        return dict_values



    def insert(self, table: str = '', fields: list = [], values: list = []):

        self.id = None #self.__cursor__.var(cx_Oracle.NUMBER)

        fields_str = self.concat_fields_str(fields)

        values_str = self.concat_values_str(fields)

        query = f'INSERT INTO meuml.{table} ({fields_str}) VALUES ({values_str}) RETURNING id into :id_value'

        dict_values: dict = self.prepare_dict_values(fields, values, self.id)

        #try:
        self.execute(query, dict_values)
        #except Exception as e:
        #    print(e)
        #    self.__error__ = e

    '''
    OLD
    '''

    '''
    def select_query(self, table: str = '', fields: list = [], conditions: dict = {}):

        fields_str = self.concat_fields_str(fields)

        query = f'SELECT {fields_str} FROM meuml.{table}'

        query += self.set_conditions(conditions=conditions)

        try:
            self.conn = self.execute(query=query)
        except Exception as e:
            self.__error__ = str(e)
    '''


    def update_item(self, table: str = '', id:int = 0, fields: list = [], values: list = []) -> dict:

        query = f'update meuml.{table} SET '

        sets = ', '.join(f'{field} = :{field}' for field in fields)

        query += sets

        dict_values: dict = {}

        c = 0

        for field in fields:
            if isinstance(values[c], Type):
                dict_values[field] = values[c].value
            else:
                dict_values[field] = values[c]
            c += 1

        query += f' WHERE id = :id'

        dict_values['id'] = id

        id, data = execute(cursor=self.__cursor__, query=query, values=dict_values)

        return dict_values

    def select_one(self, table: str = '', fields: list = [], index: int = 0) -> dict:

        fields_str = ', '.join(str(var) for var in fields)

        query = f'SELECT {fields_str} FROM meuml.{table} WHERE id = :id'
        data = self.execute(query=query, values={'id': index})
        print(data)
        return fetch_one(data)


    def delete_item(self, table: str = '', index: int = 0) -> dict:

        query = f'DELETE FROM meuml.{table} WHERE id = :id'
        dict_values: dict = {}
        dict_values['id_value'] = index

        id: list = []
        data: dict = {}

        try:
            id, data = execute(self.__cursor__, index, query, dict_values)
        except Exception as e:
            print(e)

        dict_values['id_value'] = str(id[0]).replace(']', '').replace('[', '').replace('.0', '')

        return dict_values