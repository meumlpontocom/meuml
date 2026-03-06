import PayerInfoForm from "./PayerDataForm";

function PayerDataModalContent() {
  return (
    <>
      <p>
        Cadastre seus dados para que o MeuML possa emitir a nota fiscal pela sua
        compra. Finalize esta etapa para gerar a cobrança.
      </p>
      <PayerInfoForm />
    </>
  );
}

export default PayerDataModalContent;
