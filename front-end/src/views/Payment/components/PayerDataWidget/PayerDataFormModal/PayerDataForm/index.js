import Tabs      from "./Tabs";
import Form      from "./Form";

function PayerInfoForm() {
  return (
    <>
      <Tabs
        CpfForm={() => <Form type="cpf" />}
        CnpjForm={() => <Form type="cnpj" />}
      />
    </>
  );
}

export default PayerInfoForm;
