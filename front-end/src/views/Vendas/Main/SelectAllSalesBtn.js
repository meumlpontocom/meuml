import { CButton } from "@coreui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAllSales } from "../../../redux/actions/_salesActions";

export default function SelectAllSalesBtn() {
  const dispatch = useDispatch();
  const selectAll = useSelector((state) => state.sales.selectAll);
  const setSelectAll = (boolean) => dispatch(setSelectedAllSales(boolean));

  function handleButtonClick() {
    setSelectAll(true);
  }

  return (
    <CButton
      size="sm"
      color="dark"
      disabled={selectAll}
      onClick={handleButtonClick}
    >
      <i className="cil-check mr-1" />
      Selecionar todas
    </CButton>
  );
}
