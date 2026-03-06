# A ideia aqui é checar quais dos atributos do anuncio da Shopee existem no Mercado Livre (a partir da categoria selecionada)
def check_shopee_attributes_that_are_valid_in_ml(tier_variations, ml_api, ml_category_id):
    ml_category_response = ml_api.get(f"/categories/{ml_category_id}/attributes")
    ml_category_attributes = ml_category_response.json()

    # {name: 'Cor', amount: 2} -> Nesse caso, verificamos que o atributo "Cor" possui duas variações
    variations_list_and_count = []
    variations_names_list = []
    valid_variation_attribute = []

    for tier_variation in tier_variations:
        variation_name = str(tier_variation['name']).lower()
        variation_amount = len(tier_variation.get('option_list', []))

        variations_names_list.append(variation_name)
        variations_list_and_count.append({
            'name': variation_name,
            'amount': variation_amount
        })

    for ml_category_attribute in ml_category_attributes:
        attribute_name = str(ml_category_attribute['name']).lower()

        if attribute_name in variations_names_list:
            found_attribute = next((attribute for attribute in variations_list_and_count if attribute['name'] == attribute_name), None)
            valid_variation_attribute.append(found_attribute)
        
    total_variations = 1

    for attribute in valid_variation_attribute:
        total_variations = total_variations * attribute['amount']

    return total_variations
    