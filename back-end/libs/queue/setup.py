from setuptools import setup, find_packages


setup(
    name='queue',
    version='0.1',
    description='Queue Control',
    py_modules=['queue'],
    install_requires=[
        'celery',
    ],
)
