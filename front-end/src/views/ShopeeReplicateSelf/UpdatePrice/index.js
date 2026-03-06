import React from "react";
import PriceAction from "./PriceAction";
import PriceActionType from "./PriceActionType";
import PriceActionValue from "./PriceActionValue";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";

function UpdatePrice({ saveForm, operationType, operation }) {
  function handleInputChange(event) {
    const { name, value } = event.target;
    saveForm(name, value);
  }
  return (
    <CCard>
      <CCardHeader className="bg-gradient-dark text-white">
        <h5>Atualizar Preço em Massa</h5>
      </CCardHeader>
      <CCardBody>
        <PriceAction
          handleInputChange={handleInputChange}
          id="operation"
          name="operation"
          action={operation}
        />
        <PriceActionType handleInputChange={handleInputChange} id="operationType" name="operationType" />
        <PriceActionValue
          disabled={!operationType}
          handleInputChange={handleInputChange}
          operationType={operationType}
          id="value"
          name="value"
        />
      </CCardBody>
    </CCard>
  );
}

export default UpdatePrice;
