import React      from "react";
import { CAlert } from "@coreui/react";

const TipAlert = () => {
  return (
    <CAlert color="secondary">
      <em>
        Informe o e-mail da sua conta e enviaremos uma mensagem no e-mail informado contendo o passo a passo
        para recuperar sua senha.
      </em>
    </CAlert>
  );
};

export default TipAlert;
