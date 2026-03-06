
class MonthsPTBR():
    translations = {
        'January': 'Janeiro',
        'February': 'Fevereiro',
        'March': 'Março',
        'April': 'Abril',
        'May': 'Maio',
        'June': 'Junho',
        'July': 'Julho',
        'August': 'Agosto',
        'September': 'Setembro',
        'October': 'Outubro',
        'November': 'November',
        'December':  'Dezembro',
    }

    @staticmethod
    def translate(word):
        return MonthsPTBR.translations.get(word.capitalize(), word)
