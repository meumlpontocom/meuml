from setuptools import setup


setup(
    name='shopee_api',
    version='0.1',
    description='Helper for Shopee API',
    py_modules=['shopee_api'],
    install_requires=[
        'requests',
        'urllib3',
    ],
)
