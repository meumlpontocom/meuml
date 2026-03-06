import os
import datetime

def ContaPertenceAOutroUsuario():

    now = datetime.datetime.now()
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")

    html_file = open(os.getenv('root_folder') + '/libs/helpers/mail/conta-pertence-outro-usuario.html')
    html = html_file.read()
    html = html.replace('{{hora}}', date_time)
    html_file.close()
    return html

