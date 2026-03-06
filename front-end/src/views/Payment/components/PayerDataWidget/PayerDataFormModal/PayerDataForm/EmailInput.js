import { useContext }                                                       from "react";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";
import { FaAt }                                                             from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserEmail }                                                     from "../../../../actions/setUserData";

function EmailInput() {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <>
      <CLabel htmlFor="payer-email">E-mail</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaAt />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="payer-email"
          name="payer-email"
          type="email"
          placeholder="E-mail"
          value={state.payerData.email || ""}
          onChange={e => dispatch(setUserEmail(e.target.value))}
        />
      </CInputGroup>
    </>
  );
}

export default EmailInput;
