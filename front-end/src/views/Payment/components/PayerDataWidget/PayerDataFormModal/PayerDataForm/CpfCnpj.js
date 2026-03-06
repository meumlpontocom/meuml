import { useContext }                                                       from "react";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";
import { FaIdCard }                                                         from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserCpfCnpj }                                                   from "../../../../actions/setUserData";

function CpfCnpj({ type }) {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <>
      <CLabel htmlFor="payer-cpf">{type === "cpf" ? "CPF" : "CNPJ"}</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaIdCard />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          type="text"
          placeholder={type === "cpf" ? "CPF" : "CNPJ"}
          id={type === "cpf" ? "payer-cpf" : "payer-cnpj"}
          name={type === "cpf" ? "payer-cpf" : "payer-cnpj"}
          value={state.payerData.cpf_cnpj || ""}
          onChange={e => dispatch(setUserCpfCnpj(e.target.value))}
        />
      </CInputGroup>
    </>
  );
}

export default CpfCnpj;
