from setuptools import setup, find_packages


setup(
    name='bitflix-cron',
    version='0.1',
    description='Cron jobs for BitFlix',
    packages=find_packages(),
    install_requires=[
        'bitflix-database',
        'asyncio',
        'aiohttp',
        'sqlalchemy',
    ],
)
