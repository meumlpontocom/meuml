
class MLPaymentsPTBR():
    translations = {
        'credit_card': 'Cartão de Crédito',
        'bank_transfer': 'Transferência Bancária',
        'debit_card': 'Cartão de Débito',
        'ticket': 'Ticket',
        'atm': 'Caixa Automático',
        'prepaid_card': 'Cartão Pré-pago',
        'visa': 'Visa',
        'master': 'Mastercard',
        'amex': 'American Express',
        'hipercard': 'Hipercard	',
        'diners': 'Diners Club International',
        'elo': 'Elo',
        'melicard': 'Cartão Mercado Livre',
        'bolbradesco': 'Boleto Bancario',
        'account_money': 'Dinheiro em conta',
        'giftcard': 'Giftcard',
        'pec': 'Pagamento na Lotérica',
        'paypal': 'Paypal',
        'approved': 'Aprovado',
        'pending': 'Pendente',
        'authorized': 'Autorizado',
        'in_process': 'Em processamento',
        'in_mediation': 'Em mediação',
        'rejected': 'Rejeitado',
        'cancelled': 'Cancelado',
        'refunded': 'Reembolsado',
        'charged_back': 'Contestado',
    }

    @staticmethod
    def translate(word):
        return MLPaymentsPTBR.translations.get(word, word)
