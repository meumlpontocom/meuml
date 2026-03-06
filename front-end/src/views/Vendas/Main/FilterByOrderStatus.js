import React                           from "react";
import { Picky }                       from "react-picky";
import { CRow, CCol, CButton, CLabel } from "@coreui/react";
import { saveStatusFilter }            from "../../../redux/actions/_salesActions";
import { useDispatch, useSelector }    from "react-redux";
import { fetchSales }                  from "./requests";

export default function FilterByOrderStatus() {
  const dispatch = useDispatch();
  const {
    selectedFilterStatus,
    filterStatusList,
    filterString,
    selectedAccounts,
    mshops
  } = useSelector(({ sales }) => sales);
  function onSelect(selected) {
    dispatch(saveStatusFilter(selected));
  }
  function handleClick() {
    fetchSales({
      dispatch,
      filterStatus: selectedFilterStatus.map((status) => status.value),
      filterString,
      selectedAccounts,
      shouldFetchMShopsData: mshops
    });
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
      <CLabel>Status da venda</CLabel>
      <CRow>
        <CCol xs="9" style={{ padding: "0px 5px 0px 15px" }}>
          <Picky
            onChange={(selected) => onSelect(selected)}
            includeSelectAll={true}
            includeFilter={true}
            dropdownHeight={600}
            multiple={true}
            options={filterStatusList}
            value={selectedFilterStatus}
            open={false}
            valueKey="value"
            labelKey="label"
            id="filter-sale-by-status"
            name="filter-sale-by-status"
            className="filter-sale-by-status"
            selectAllText="Selecionar Todos"
            filterPlaceholder="Filtrar por..."
            allSelectedPlaceholder="%s Selecionados"
            manySelectedPlaceholder="%s Selecionados"
            placeholder="filtrar por status da venda"
          />
        </CCol>
        <CCol xs="3" className="pl-1" style={{ padding: "0px 0px 0px 5px" }}>
          <CButton
            color="primary"
            className="filter-button"
            onClick={handleClick}
          >
            <i className="cil-filter mr-2 icon-fix" />
            Filtrar
          </CButton>
        </CCol>
      </CRow>
    </CCol>
  );
}
