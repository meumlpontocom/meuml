from setuptools import setup


setup(
    name='mercadopago_api',
    version='0.1',
    description='Helper for MercadoPago API',
    py_modules=['mercadopago_api'],
    install_requires=[
        'requests',
        'urllib3',
    ],
)
