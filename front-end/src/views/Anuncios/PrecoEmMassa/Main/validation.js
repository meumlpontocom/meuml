import * as Yup from "yup";

export const validationDiscount = Yup.object().shape({
  price_rate: Yup.string("Valor inválido"),
  price_percent: Yup.number("Valor inválido").when(
    "price_rate",
    (validInput, field) => {
      if (validInput === "1" || validInput === 1) {
        return field
          .typeError("Porcentagem obrigatória")
          .min(0, "0 é a porcentagem mínima")
          .required("Porcentagem obrigatória");
      }
      return field;
    }
  ),
  price_real: Yup.number("Valor inválido").when(
    "price_rate",
    (validInput, field) => {
      if (validInput === "0" || validInput === 0) {
        return field
          .typeError("Valor obrigatório")
          .min(0, "0 é o valor mínimo")
          .required("Valor obrigatório");
      }
      return field;
    }
  )
});
