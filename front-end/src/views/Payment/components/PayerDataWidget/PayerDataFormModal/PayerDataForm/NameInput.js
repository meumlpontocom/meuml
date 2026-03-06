import { useContext }                                                       from "react";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";
import { FaUser }                                                           from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserName }                                                      from "../../../../actions/setUserData";

function NameInput() {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <>
      <CLabel htmlFor="payer-name">Nome</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaUser />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="payer-name"
          name="payer-name"
          type="text"
          placeholder="Nome"
          value={state.payerData.razao_social || ""}
          onChange={e => dispatch(setUserName(e.target.value))}
        />
      </CInputGroup>
    </>
  );
}

export default NameInput;
