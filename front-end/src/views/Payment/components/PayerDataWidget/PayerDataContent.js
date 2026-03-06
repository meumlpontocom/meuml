import { useContext } from "react";
import paymentContext from "../../paymentContext";

function PayerDataContent() {
  const { state } = useContext(paymentContext);
  return (
    <p className="text-info">
      {state.isLoadingPayerInfo ? (
        <em>Carregando dados pessoais</em>
      ) : Object.keys(state.payerData)?.length ? (
        <>
          <em>
            {String(state.payerData.cpf_cnpj).length > 14
              ? "Razão Social"
              : "Nome"}
            :&nbsp;{state.payerData.razao_social}
          </em>
          <br />
          <em>
            {String(state.payerData.cpf_cnpj).length > 14 ? "CNPJ" : "CPF"}
            :&nbsp;{state.payerData.cpf_cnpj}
          </em>
        </>
      ) : (
        <em>Cadastrar dados pessoais</em>
      )}
      <br />
      <small className="text-muted float-right">Clique para editar</small>
    </p>
  );
}

export default PayerDataContent;
