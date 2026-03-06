import os

def NotificarVencimento(accounts: str = '', package: str = '', modules: str = '', price: str = '', expiration_date: str = ''):

    #"Para confirmar seu cadastro no BitFlix.com.br clique no link: \n" + self.config.SITE_URL + "Contas/Confirmar/" + email + "/" + hash
    html_file = open(os.getenv('ROOT_FOLDER') + '/libs/mail/mail_templates/lembrete-assinatura.html')
    html = html_file.read()
    html = html.replace('{{url}}', os.getenv('SITE_URL'))
    html = html.replace('{{accounts}}', accounts)
    html = html.replace('{{package}}', package)
    html = html.replace('{{modules}}', modules)
    html = html.replace('{{price}}', price)
    html = html.replace('{{expiration_date}}', expiration_date)
    html_file.close()
    return html

