import { useContext }                                                       from "react";
import { FaUser }                                                           from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserAddressDistrict }                                           from "../../../../actions/setUserData";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";

function DistrictInput() {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <>
      <CLabel htmlFor="payer-address-district">Bairro</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaUser />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="payer-address-district"
          name="payer-address-district"
          type="text"
          placeholder="Bairro"
          value={state.payerData.bairro}
          onChange={e => dispatch(setUserAddressDistrict(e.target.value))}
        />
      </CInputGroup>
    </>
  );
}

export default DistrictInput;
