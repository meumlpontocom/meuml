import os

def ConfirmarCadastro(url : str = '', hash  : str = '', email  : str = ''):

    #"Para confirmar seu cadastro no BitFlix.com.br clique no link: \n" + self.config.SITE_URL + "Contas/Confirmar/" + email + "/" + hash
    html_file = open(os.getenv('ROOT_FOLDER') + '/libs/mail/mail_templates/confirmar-cadastro.html')
    html = html_file.read()
    html = html.replace('{{url}}', url)
    html = html.replace('{{email}}', email)
    html = html.replace('{{hash}}', hash)
    html_file.close()
    return html

