import { useContext }                                                       from "react";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";
import { FaPenFancy }                                                       from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserAddressComplement }                                         from "../../../../actions/setUserData";

function ComplementInput() {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <>
      <CLabel htmlFor="payer-address-complement">Complemento</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaPenFancy />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="payer-address-complement"
          name="payer-address-complement"
          type="text"
          placeholder="Complemento"
          value={state.payerData.complemento || ""}
          onChange={e => dispatch(setUserAddressComplement(e.target.value))}
        />
      </CInputGroup>
    </>
  );
}

export default ComplementInput;
