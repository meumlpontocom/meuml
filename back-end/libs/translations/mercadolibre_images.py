class MLImagesPTBR():
    translations = {
        "Asegúrate de que la imagen tenga como mínimo 500 píxeles en uno de los lados": "Certifique-se de que a imagem tenha pelo menos 500 pixels de altura e de largura",
        "Tené en cuenta que de tener bordes en blanco estos se eliminan dejando un margen total del 10%": "Lembre-se de que, tendo bordas em branco, elas são eliminadas, deixando uma margem total de 10%",
        "Te recomendamos usar 1200 x 1200 para poder hacer zoom": "Recomendamos o uso de 1200 x 1200 para usar zoom",
        "La imagen subida, procesados los bordes blancos, tiene un tamaño ": "A imagem enviada, processadas as margens brancas, tem um tamanho de ",
    }

    @staticmethod
    def translate(word):
        return MLImagesPTBR.translations.get(word, word)