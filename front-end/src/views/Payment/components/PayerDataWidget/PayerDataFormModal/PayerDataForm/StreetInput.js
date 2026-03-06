import { useContext }                                                       from "react";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";
import { FaRoad }                                                           from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserAddressStreet }                                             from "../../../../actions/setUserData";

function StreetInput() {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <>
      <CLabel htmlFor="payer-street">Endereço</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaRoad />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="payer-street"
          name="payer-street"
          type="text"
          placeholder="Endereço"
          value={state.payerData.logradouro}
          onChange={e => dispatch(setUserAddressStreet(e.target.value))}
        />
      </CInputGroup>
    </>
  );
}

export default StreetInput;
