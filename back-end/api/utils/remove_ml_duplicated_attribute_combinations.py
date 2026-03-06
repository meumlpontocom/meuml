import json
# Recebe um array de variations do tipo:
# {
#     "attribute_combinations": [{ "value_name": "Preto / AZUL", "id": "COLOR" }],
#     "available_quantity": 10,
#     "price": 12200,
#     "attributes": [],
#     "picture_ids": ["916953-MLB96858111902_112025"]
# }

# E elimina os elementos que tiverem o attribute_combinations duplicado.
# Faz isso ordenando os objetos do attribute combinations com base no ID, e transformando eles em string, e comparando-os, se forem exatamente iguais, ignora um deles.

def remove_ml_duplicated_attribute_combinations(ml_variations):
    unique_combination = []
    seen_combination = set()

    for variation in ml_variations:
        # Serializa as combinações em uma string para poder comparar (ordena para evitar ordem diferente)
        combos = variation["attribute_combinations"]
        combos_key = json.dumps(sorted(combos, key=lambda x: x["id"]))
        
        if combos_key not in seen_combination:
            seen_combination.add(combos_key)
            unique_combination.append(variation)
    
    return unique_combination