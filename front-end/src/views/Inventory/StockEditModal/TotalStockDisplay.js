import React from "react";
import {
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
} from "@coreui/react";

const TotalStockDisplay = ({ productStock }) => {
  return (
    <CInputGroup>
      <CInputGroupPrepend>
        <CInputGroupText className={"bg-secondary text-dark"}>
          Estoque total
        </CInputGroupText>
      </CInputGroupPrepend>
      <CInput
        disabled
        readOnly
        type="number"
        id="total-stock"
        name="total-stock"
        value={productStock}
      />
    </CInputGroup>
  );
};

export default TotalStockDisplay;
