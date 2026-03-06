import { useContext }                                                       from "react";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";
import { FaSortNumericDown }                                                from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserAddressNumber }                                             from "../../../../actions/setUserData";

function NumberInput() {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <>
      <CLabel htmlFor="payer-address-number">Número</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaSortNumericDown />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="payer-address-number"
          name="payer-address-number"
          type="number"
          placeholder="Número"
          value={state.payerData.numero || ""}
          onChange={e => dispatch(setUserAddressNumber(e.target.value))}
        />
      </CInputGroup>
    </>
  );
}

export default NumberInput;
