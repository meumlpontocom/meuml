from libs.database.model import Model
from libs.database.types import Date, Date, Varchar2, Number, Clob
import datetime


class Accounts(Model):
    __tablename__ = 'accounts'
    id = Number(field='id')
    access_token_created_at = Date(field='access_token_created_at')
    access_token_expires_at = Date(field='access_token_expires_at')
    refresh_token = Varchar2(field='refresh_token')
    date_created = Date(default=datetime.datetime.now(),field='date_created')
    date_modified = Date(field='date_modified')
    user_id = Number(field='user_id')
    name = Varchar2(field='name')
    external_id = Number(field='external_id')
    external_data = Clob(field='external_data')
    external_name = Varchar2(field='external_name')
    access_token = Varchar2(field='access_token')
    total_advertisings = Number(field='total_advertisings   ')
    total_orders = Number(field='total_orders')
