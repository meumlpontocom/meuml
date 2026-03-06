import React from "react";
import { CAlert, CCol } from "@coreui/react";

const PixTipAlert = () => {
  return (
    <CCol style={{ paddingLeft: 0, marginLeft: 0 }}>
      <CAlert color="warning">
        <h5>
          <em>Pagamento de assinatura ou compra de créditos via PIX:</em>
        </h5>
        <ol>
          <li>Faça a compra normalmente pelo sistema.</li>
          <li>O pagamento será realizado automaticamente via PIX, e um QR Code será gerado.</li>
          <li>Escaneie o QR Code para efetuar o pagamento.</li>
          <li>A liberação dos créditos é automática no sistema e ocorrerá em alguns minutos.</li>
          <li>
            Se o QR Code não aparecer, pode ser devido a instabilidades no sistema. Nesse caso, tente
            novamente em outro momento.
          </li>
        </ol>
      </CAlert>
    </CCol>
  );
};

export default PixTipAlert;
