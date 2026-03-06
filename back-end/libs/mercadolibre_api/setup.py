from setuptools import setup


setup(
    name='mercadolibre_api',
    version='0.1',
    description='Helper for MercadoLibre API',
    py_modules=['mercadolibre_api'],
    install_requires=[
        'requests',
        'urllib3',
    ],
)
