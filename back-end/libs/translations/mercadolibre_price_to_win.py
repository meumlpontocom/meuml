
class MLPriceToWinPTBR():
    translations = {
        'boosted': 'tem a condição de venda e atualmente aplica o aumento.',
        'not_boosted': 'possui a condição de venda, mas não é um boost que aumenta as chances de ganhar.',
        'opportunity': 'não possui condição de venda. Caso aplique, melhoraria as chances de ganhar.',
        'not_apply': 'a condição de vendas não se aplica como um boost ao produto em que o item concorre.',  
        'non_trusted_seller': 'O vendedor não está na lista de permissões de fraude. Não pode competir. Ele aparece nas listagens em segundo plano.',
        'reputation_below_threshold': 'O vendedor não atinge a reputação mínima para ganhar. Não pode competir. Aparece apenas nas listagens.',
        'winner_has_better_reputation': 'O vendedor tem uma reputação que pode competir, mas há um vencedor com uma reputação melhor. No momento, ele aparece apenas nas listagens (caixa amarela com vencedor verde).',
        'manufacturing_time': 'O item possui manufacturing time, aparece apenas nas listagens e não pode vencer porque o vencedor possui estoque imediato.',
        'temporarily_winning_manufacturing_time': 'O item possui manufacturing time, está ganhando temporariamente porque não há concorrentes no mesmo nível de reputação sem MF.',
        'temporarily_competing_manufacturing_time': 'O item tiene manufacturing time, esta compitiendo temporalmente porque no hay competidores en el mismo nivel de reputación sin MF, el winner también tiene MF.',
        'temporarily_winning_best_reputation_available': 'O vendedor não é verde, mas tem uma reputação que pode ganhar e é a melhor oferta disponível. Ele está ganhando temporariamente. Se uma oferta melhor aparecer, pare de ganhar.',
        'temporarily_competing_best_reputation_available': 'O vendedor não é verde, mas é a melhor reputação disponível, está competindo temporariamente. O vencedor também é da mesma reputação. Se um best-seller aparecer, ele será listado apenas novamente.',
        'item_paused': 'O item está em pausa, não pode ser listado.',
        'item_not_opted_in': 'O item não fiz opt in, não pode ser listado ou é um item de teste.',
        'winning': 'Ganhando',
        'competing': 'Perdendo',
        'listed': 'Perdendo',
        'not_listed': 'Não listado',
        'sharing_first_place': 'Compartilhando o primeiro lugar',
        'same_day_shipping': 'Envios no dia com Mercado Envios.',
        'fulfillment': 'Mercado Envios Full.',
        'free_installments': 'Parcelamento sem juros.',
        'free_shipping': 'Frete grátis com Mercado Envios.',
        'shipping_quarantine': 'Envio normal.',
        'shipping_collect': 'Mercado Envios Coleta.',
        'boosted': 'Tem a condição de venda e atualmente aplica o aumento.',
        'not_boosted': 'Possui a condição de venda, mas não é um boost que aumenta as chances de ganhar.',
        'opportunity': 'Não possui condição de venda. Caso aplique, melhoraria as chances de ganhar.',
        'not_apply': 'A condição de vendas não se aplica como um boost ao produto em que o item concorre.'
    }

    @staticmethod
    def translate(word):
        return MLPriceToWinPTBR.translations.get(word, word)
