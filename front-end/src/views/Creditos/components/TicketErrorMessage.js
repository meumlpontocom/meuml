import React from "react";

const TicketErrorMessage = ({ error }) => {
  return (
    error && (
      <p className="text-danger fade-in">Pagamentos em boleto devem possuit o valor mínimo de R$20,00.</p>
    )
  );
};

export default TicketErrorMessage;
