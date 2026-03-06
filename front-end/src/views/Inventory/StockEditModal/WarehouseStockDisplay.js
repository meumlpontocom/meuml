import React from "react";
import {
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
} from "@coreui/react";

const WarehouseStockDisplay = ({ warehouseStock }) => {
  return (
    <CInputGroup>
      <CInputGroupPrepend>
        <CInputGroupText className={"bg-secondary text-dark"}>
          Estoque neste armazém
        </CInputGroupText>
      </CInputGroupPrepend>
      <CInput
        disabled
        readOnly
        type="number"
        id="warehouse-stock"
        name="warehouse-stock"
        value={warehouseStock}
      />
    </CInputGroup>
  );
};

export default WarehouseStockDisplay;
