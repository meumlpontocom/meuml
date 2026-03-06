import { useCallback, useContext, useEffect, useMemo }                        from "react";
import { FaSign, FaSyncAlt }                                                  from "react-icons/fa";
import { CLabel, CInputGroup, CInputGroupPrepend }                            from "@coreui/react";
import { CInputGroupText, CInput, CInputGroupAppend, CButton }                from "@coreui/react";
import paymentContext                                                         from "src/views/Payment/paymentContext";
import useFetchViaCep                                                         from "src/views/Payment/hooks/useFetchViaCep";
import { setUserAddressCity, setUserAddressCityCode, setUserAddressDistrict } from "src/views/Payment/actions/setUserData";
import { setUserAddressProvince, setUserAddressStreet, setUserZipCode }       from "src/views/Payment/actions/setUserData";

function ZipCodeInput() {
  const { state, dispatch } = useContext(paymentContext);
  const [cep, fetchCep, isLoading] = useFetchViaCep();

  const isCepValid = useMemo(
    () => state.payerData.cep !== undefined && state.payerData.cep?.length >= 8,
    [state.payerData.cep],
  );

  const updateUserData = useCallback(
    ({ logradouro, bairro, localidade, ibge, uf }) => {
      dispatch(setUserAddressStreet(logradouro));
      dispatch(setUserAddressDistrict(bairro));
      dispatch(setUserAddressCity(localidade));
      dispatch(setUserAddressCityCode(ibge));
      dispatch(setUserAddressProvince(uf));
    },
    [dispatch],
  );

  const handleBtnClick = useCallback(() => {
    if (isCepValid && !isLoading) fetchCep(state.payerData.cep);
  }, [fetchCep, isCepValid, isLoading, state.payerData.cep]);

  useEffect(() => {
    if (cep && !isLoading)
      updateUserData(cep);
  }, [cep, isLoading, updateUserData]);

  return (
    <>
      <CLabel htmlFor="payer-zipcode">CEP</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaSign />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="payer-zipcode"
          name="payer-zipcode"
          type="text"
          placeholder="CEP"
          value={state.payerData.cep || ""}
          onChange={e => dispatch(setUserZipCode(e.target.value))}
          onBlur={handleBtnClick}
        />
        <CInputGroupAppend>
          <CButton disabled={!isCepValid} onClick={handleBtnClick} size="sm">
            <FaSyncAlt />
          </CButton>
        </CInputGroupAppend>
      </CInputGroup>
    </>
  );
}

export default ZipCodeInput;
