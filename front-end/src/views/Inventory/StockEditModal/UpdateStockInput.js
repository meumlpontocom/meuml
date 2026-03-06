import React from "react";
import {
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
} from "@coreui/react";
import { sanitizeQuantityInput } from "../helpers";

const UpdateStockInput = ({ quantity, setQuantity, label }) => {
  return (
    <CInputGroup>
      <CInputGroupPrepend>
        <CInputGroupText className={"bg-gradient-primary text-white"}>
          <label htmlFor="update-stock-input">{label}</label>
        </CInputGroupText>
      </CInputGroupPrepend>
      <CInput
        type="number"
        min="1"
        step="1"
        id="update-stock-input"
        name="update-stock-input"
        value={quantity}
        onKeyDown={(e) => sanitizeQuantityInput(e)}
        onChange={(e) => setQuantity(e.target.value)}
      />
    </CInputGroup>
  );
};

export default UpdateStockInput;
