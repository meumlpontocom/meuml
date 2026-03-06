import React      from "react";
import { CAlert } from "@coreui/react";

function NoPhoneRegisteredTip() {
  return (
    <CAlert color="success">
      <h6>Nenhum número cadastrado.</h6>
      <p>
        Utilize o campo acima para configurar um novo número.
        Lembre-se de selecionar as <u>opções</u> desejadas.
      </p>
    </CAlert>
  );
}

export default NoPhoneRegisteredTip;
