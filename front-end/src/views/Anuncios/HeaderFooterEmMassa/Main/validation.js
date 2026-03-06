import * as Yup from "yup";

export const validationHeaderFooter = Yup.object().shape({
  header: Yup.string("Valor inválido").required("Campo obrigatório"),
  footer: Yup.string("Valor inválido").required("Campo obrigatório")
});
