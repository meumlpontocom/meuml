import React    from "react";
import { CCol } from "@coreui/react";
import logo     from "src/assets/img/brand/sygnet-logo.png";

const CardHeader = () => {
  return (
    <CCol className="text-center">
      <h2>
        <img src={logo} width="30%" className="espacoLogoCadastro" alt="MeuML" />
      </h2>
      <h3 className="mb-3">Recuperar Senha</h3>
    </CCol>
  );
};

export default CardHeader;
