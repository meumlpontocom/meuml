import { useContext }                                                       from "react";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";
import { FaIdCard }                                                         from "react-icons/fa";
import paymentContext                                                       from "../../../../paymentContext";
import { setUserInscricaoMunicipal }                                        from "../../../../actions/setUserData";

function CnpjInscription({ type }) {
  const { state, dispatch } = useContext(paymentContext);
  return type === "cnpj" ? (
    <>
      <CLabel htmlFor="payer-inscricao_municipal">Inscrição Municipal</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaIdCard />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          type="text"
          placeholder="Inscrição Municipal"
          id="payer-inscricao_municipal"
          name="payer-inscricao_municipal"
          value={state.payerData.inscricao_municipal}
          onChange={e => dispatch(setUserInscricaoMunicipal(e.target.value))}
        />
      </CInputGroup>
    </>
  ) : (
    <></>
  );
}

export default CnpjInscription;
  