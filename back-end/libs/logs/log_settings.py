import settings
import logging.config
import yaml
import os

logging.config.dictConfig(yaml.load(open(os.getenv('BASE_FOLDER') + '/meuml2core/libs/logs/logs.conf'), Loader=yaml.FullLoader))



def get_logger(logger : str = 'file'):
    return logging.getLogger(logger)


def write_log(logger : str = 'file'):
    pass

