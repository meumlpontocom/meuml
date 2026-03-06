export default (mode) => {
  switch (mode) {
    case "me1":
      return "Mercado Envios Tipo 1";

    case "me2":
      return "Mercado Envios Tipo 2 Comum";

    case "col":
      return "Mercado Envios Coletas";

    case "full":
      return "Mercado Envios Full";

    case "mis":
      return "Misto (ME Comum + Coletas)";

    case "ac":
      return "Entrega a Combinar";

    case "per":
      return "Frete Personalizado";

    default:
      return "Frete não Especificado";
  }
};
