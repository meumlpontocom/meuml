import { CButton } from "@coreui/react";
import React from "react";
import { useDispatch } from "react-redux";
import { setSelectedAllSales } from "src/redux/actions/_salesActions";

export default function UnselectAllSalesBtn() {
  const dispatch = useDispatch();
  const setSelectAll = (boolean) => dispatch(setSelectedAllSales(boolean));

  function handleButtonClick() {
    setSelectAll(false);
  }

  return (
    <CButton
      size="sm"
      color="secondary"
      onClick={handleButtonClick}
    >
      <i className="cil-minus mr-1" />
      Limpar seleção
    </CButton>
  );
}
