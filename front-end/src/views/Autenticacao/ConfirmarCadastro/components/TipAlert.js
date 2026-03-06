import React                from "react";
import { CAlert, CPopover } from "@coreui/react";

const TipAlert = ({ email }) => {
  const TipText = ({ children }) => {
    return (
      <CPopover placement="top" content={email}>
        <span className="text-success">{children}</span>
      </CPopover>
    );
  }
  return (
    <CAlert color="secondary" className="fade-in text-left">
      <em>
        Para confirmar sua conta,
        <br />
        informe o <TipText>código enviado no e-mail</TipText> da sua conta, no campo abaixo.
        <br />
        <small className="text-danger">Lembre-se de verificar as pastas de <b>SPAM</b> e <b>LIXEIRA</b> do seu e-mail.</small>
      </em>
    </CAlert>
  );
};

export default TipAlert;
