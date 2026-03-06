import * as Yup from "yup";

export const validationHeaderFooter = Yup.object().shape({
  description: Yup.string("Valor inválido").required("Campo obrigatório")
});
