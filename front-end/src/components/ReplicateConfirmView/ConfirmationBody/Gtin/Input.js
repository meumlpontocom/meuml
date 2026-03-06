import React, { useCallback }       from "react";
import { useDispatch, useSelector } from "react-redux";
import showGtinTip                  from "./showGtinTip";
import { FaBarcode }                from "react-icons/fa";
import { setGtin }                  from "src/redux/actions/_replicationActions";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel } from "@coreui/react";

const Input = () => {
  const dispatch          = useDispatch();
  const GTIN              = useSelector(state => state.advertsReplication.bulkEdit.GTIN);
  const handleInputChange = useCallback(({ target: { value }}) => {
    if (Number(value) || value === "") dispatch(setGtin(value));
  }, [dispatch]);
  return (
    <>
      <CLabel htmlFor="GTIN">GTIN / EAN</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaBarcode />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          id="GTIN"
          type="text"
          name="GTIN"
          value={GTIN}
          onChange={handleInputChange}
          placeholder="Ex.: 190198043641"
        />
      </CInputGroup>
      <small>
        Informe um código válido ou deixe em branco e utilize o do anúncio original&nbsp;
        <span className="text-primary pointer" onClick={showGtinTip}>Clique aqui para saber mais</span>.
      </small>
    </>
  );
}

export default Input;
