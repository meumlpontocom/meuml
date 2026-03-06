from marshmallow.fields import String, List
from marshmallow.schema import Schema as Schema2


class IPListSchema(Schema2):
    class Meta:
        strict = True
        type_ = 'ipfilter'
    ip_list = List(String(), required=True)
