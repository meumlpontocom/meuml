import React, { useCallback }       from "react";
import { FaBarcode }                from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  CCol,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput
} from "@coreui/react";

const EAN = () => {
  const dispatch = useDispatch();
  const ean      = useSelector((state) => state.advertsReplication.bulkEdit.ean);

  const setEan = useCallback(value => {
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "ean", value },
    })
  },[dispatch]);

  const handleChange = useCallback(({ target: { value } }) => setEan(value), [setEan]);

  return (
    <CCol style={{ padding: 0, marginTop: "9px" }}>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaBarcode />
            &nbsp;GTIN/EAN
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput type="text" value={ean} onChange={handleChange} placeholder="Identificador do produto"/>
      </CInputGroup>
    </CCol>
  );
};

export default EAN;
