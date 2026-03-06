
class MLAdvertisingPTBR():
    translations = {
        "available_quantity": "Quantidade disponível",
        "price": "Preço",
        "video_id": "Video",
        "pictures": "Imagens",
        "description": "Descrição",
        "status": "Status",
        "sale_terms": "Condições de Venda",
        "title": "Título",
        "category_id": "Categoria",
        "shipping": "Frete",
        "condition": "Condição",
        "attributes": "Atributos", 
        "variations": "Variações", 
        "listing_type_id": "Tipo de Exposição"
    }

    @staticmethod
    def translate(word):
        return MLAdvertisingPTBR.translations.get(word, word)
