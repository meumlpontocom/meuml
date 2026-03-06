from setuptools import setup


setup(
    name='whatsapp_api',
    version='0.1',
    description='Helper for sending/receiving WhatsApp messages through third-party API',
    py_modules=['whatsapp_api'],
    install_requires=[
        'requests',
        'urllib3',
    ],
)
