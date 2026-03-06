from libs.exceptions.exceptions import MailException
import os
import os
import settings
import traceback
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail as mailsendrig
from flask import current_app
from flask_mail import Mail, Message
import flask_mail

from celery.utils.log import get_task_logger
LOGGER = get_task_logger(__name__)

class Mail(object):

    current_app = None

    subject = ''

    sender = 'contato@meuml.com'

    recipients = []

    body = ''

    def __init__(self,current_app = None):
        self.sender = 'contato@meuml.com'
        self.current_app = current_app

    def set_subject(self, subject : str = ''):
        self.subject = subject
        return self


    def set_sender(self, sender: str = 'contato@meuml.com'):
        self.sender = sender
        return self


    def set_recipients(self, recipients: list = []):
        if len(recipients) == 0:
            raise MailException('Não é possivel definir uma lista vazia de destinatários.')

        if len(self.recipients) > 0:
            self.recipients = self.recipients + recipients
        else:
            self.recipients = recipients
        return self


    def set_body(self, body : str = ''):
        self.body = body
        return self


    def send(self, recipients : list = [], plain_text: str = '', plain_text_only: bool = False):
        if len(recipients) > 0:
            self.recipients = self.recipients + recipients

        if len(self.recipients) == 0:
            raise MailException('Não é possivel enviar email sem destinatários.')

        mail = flask_mail.Mail(current_app) if self.current_app is None else flask_mail.Mail(self.current_app)

        msg = Message(self.subject, sender=("MeuML.com", self.sender),
                      recipients=self.recipients)

        if not plain_text_only:
            msg.html = self.body.encode('utf-8')
        msg.body = plain_text

        try:
            # with mail.record_messages() as outbox:
            mail.send(msg)

                # Para ver a resposta do send, descomente os LOGGERs abaixo 
                # LOGGER.error('outbox inside of Mail.send')
                # LOGGER.error(outbox)

        except Exception as exc:

            LOGGER.error(traceback.format_exc())
