import React from "react";
import { Redirect } from "react-router-dom";

const HandleRedirect = ({ redirectToPayment }) => {
  return !redirectToPayment ? null : (
    <Redirect
      to={{ pathname: "/pagamento", state: {} }}
      from="/creditos/comprar"
    />
  );
};

export default HandleRedirect;
