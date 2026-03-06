import React from "react";

//CoreUI
import { CCol, CButton, CLabel, CInput } from "@coreui/react";

import { useSelector, useDispatch } from "react-redux";
import {
  saveFilterString,
  resetFilterString,
} from "../../../redux/actions/_salesActions";
import { fetchSales } from "./requests";

const SalesFilterAccounts = () => {
  const dispatch = useDispatch();
  const { filterString, selectedAccounts, mshops } = useSelector(
    (state) => state.sales
  );

  function handleChange({ target: { value } }) {
    dispatch(saveFilterString(value));
  }

  function clearInputValue() {
    dispatch(resetFilterString());
  }

  return (
    <CCol
      xs="12"
      sm="12"
      md="12"
      lg="12"
      xl="8"
      className="mt-3 mt-xs-0 mb-3"
      style={{ paddingLeft: "15px" }}
    >
      <CLabel htmlFor="filter-by" className="pl-1">
        ID, produto, cliente
      </CLabel>
      <div className="d-flex flex-wrap ">
        <div className="mr-2 mb-3 mb-sm-0 flex-grow-1">
          <CInput
            onChange={handleChange}
            value={filterString}
            id="filter-by"
            name="filter-by"
            placeholder="ID do pedido, nome do produto ou nome do cliente"
          />
        </div>
        <div className="d-flex">
          <CButton
            color="primary"
            className="mr-2 search-button"
            onClick={() =>
              fetchSales({ dispatch, selectedAccounts, filterString, shouldFetchMShopsData: mshops })
            }
          >
            <i className="cil-search mr-2 icon-fix" /> Pesquisar
          </CButton>
          <CButton
            color="secondary"
            className="clear-button"
            onClick={clearInputValue}
          >
            <i className="cil-x mr-2 icon-fix" /> Limpar
          </CButton>
        </div>
      </div>
    </CCol>
  );
};

export default SalesFilterAccounts;
