import React, { useContext } from "react";
import { CAlert, CPopover }  from "@coreui/react";
import updatePasswordContext from "../updatePasswordContext";

const TipAlert = () => {
  const { email } = useContext(updatePasswordContext);
  const TipText = ({ children }) => {
    return (
      <CPopover placement="top" content={email}>
        <span className="text-success">{children}</span>
      </CPopover>
    );
  }
  return (
    <CAlert color="secondary">
      Para alterar sua senha,
      <br />
      <em>
        informe o <TipText>código enviado no e-mail</TipText> da sua conta, no campo abaixo. Então, crie uma nova senha.
      </em>
      <br />
      <small className="text-danger">Lembre-se de verificar as pastas de <b>SPAM</b> e <b>LIXEIRA</b> do seu e-mail.</small>
    </CAlert>
  );
};

export default TipAlert;
