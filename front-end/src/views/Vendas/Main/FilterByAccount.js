import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { saveSelectedAccounts } from "../../../redux/actions/_salesActions";
import SelectAccounts from "../../../components/SelectAccounts";

//CoreUI
import { CCol, CRow, CLabel } from "@coreui/react";


export default function FilterByAccount() {
  const dispatch = useDispatch();
  const { selectedAccounts } = useSelector(
    (state) => state.sales
  );
  function handleCallback(selected) {
    dispatch(saveSelectedAccounts(selected));
  }
  return (
    <CCol
      xs="12"
      sm="12"
      md="6"
      lg="6"
      xl="6"
      className="mb-3 mb-xl-0"
    >
      <CLabel htmlFor="select-account">Conta do ML</CLabel>
      <CRow id="select-account">
        <CCol style={{ padding: "0px 5px 0px 15px" }}>
          <SelectAccounts
            callback={handleCallback}
            selected={selectedAccounts}
            placeholder="Filtrar por conta(s)"
          />
        </CCol>
      </CRow>
    </CCol>
  );
}
