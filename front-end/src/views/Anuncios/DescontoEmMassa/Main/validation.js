import * as Yup from "yup";

export const validationDiscount = Yup.object().shape({
  buyers_discount_percentage: Yup.number("Valor inválido")
    .typeError("Valor obrigatório")
    .required("Valor obrigatório"),
  start_date: Yup.date("Data obrigatória")
    .min(new Date(), "Data inicial deve ser após a data de hoje")
    .required("Data obrigatória"),
  finish_date: Yup.date("Data obrigatória")
    .when(
      "start_date",
      (start_date, schema) =>
        start_date &&
        schema.min(start_date, "Data de fim deve ser após a data de início")
    )
    .required("Data obrigatória")
    .typeError("Campo obrigatório")
});
