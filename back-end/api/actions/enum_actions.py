from flask_jwt_simple import jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare

from libs.enums.access_type import AccessType
from libs.enums.gateway import Gateway
from libs.enums.marketplace import Marketplace
from libs.enums.promotions import Promotions
from libs.enums.tags import TagType
from libs.enums.whatsapp_topics import WhatsappTopics
import json

class EnumActions(Actions):
    @jwt_required
    def access_types(self):
        data = {}
        for item in AccessType:
            data[item.name] = item.value
        return self.return_success(data=data)

    @jwt_required
    def gateways(self):
        data = {}
        for item in Gateway:
            data[item.name] = item.value
        return self.return_success(data=data)

    @jwt_required
    def marketplaces(self):
        data = {}
        for item in Marketplace:
            data[item.name] = item.value
        return self.return_success(data=data)

    @jwt_required
    @prepare
    def modules(self):
        datas = []
        query = f'SELECT id, title, price FROM meuml.modules'
        values = {}
        responses = self.fetchall(query, values)
        for response in responses:
            tasks = []
            query = f'SELECT mt.module_id, mt.tool_id, mt.access_type, at.title, tl.name, tl.price FROM meuml.module_tasks mt JOIN meuml.access_types at ON at.id = mt.access_type JOIN meuml.tools tl ON tl.id = mt.tool_id '
            m_tasks = self.fetchall(query, values)
            for m_task in m_tasks:
                r_id = response['id']
                module_id = m_task['module_id']
                if r_id == module_id:
                    task = {
                        'access_type':m_task['title'],
                        'tool':m_task['name'],
                        'price':m_task['price']
                    }
                    tasks.append(task)
            data = {
                'id': response['id'],
                'title':response['title'],
                'price':response['price'],
                'tasks':tasks,
            }
            datas.append(data)
        return self.return_success(data=datas)

    def tags(self):
        data = {}
        for item in TagType:
            data[item.name] = item.value
        return self.return_success(data=data)

    def promotion_types(self):
        return self.return_success(data=Promotions.database_rows)

    @jwt_required
    def whatsapp_topics(self):
        return self.return_success(data=WhatsappTopics.topics)