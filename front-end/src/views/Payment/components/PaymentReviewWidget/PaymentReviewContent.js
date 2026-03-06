import { useContext } from "react";
import paymentContext from "../../paymentContext";

function PaymentConfirmationContent() {
  const { state } = useContext(paymentContext);
  return (
    <div className="text-left">
      <h4>Detalhes:</h4>
      <p>
        <strong>Valor total:</strong> {state.payments?.totalFormatted}
      </p>
      <p>
        <strong>Dados do pagador:</strong>
      </p>
      <ul>
        <li>
          <strong>Nome:</strong>&nbsp;{state.payerData?.razao_social}
        </li>
        <li>
          <strong>Documento:</strong>&nbsp;{state.payerData?.cpf_cnpj}
        </li>
        <li>
          <strong>E-mail:</strong>&nbsp;{state.payerData?.email}
        </li>
        <li>
          <strong>CEP:</strong>&nbsp;{state.payerData?.cep}
        </li>
      </ul>
    </div>
  );
}

export default PaymentConfirmationContent;
