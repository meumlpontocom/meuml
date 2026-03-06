import React from "react";
import PropTypes from "prop-types";
import InputContainer from "./InputContainer";
import NumberFormat from "react-number-format";
import { CInput } from "@coreui/react";

function PriceActionValue({ operationType, handleInputChange, ...props }) {
  return operationType !== "percentage" ? (
    <InputContainer icon="cash" symbol="$" label={operationType && "Valor"}>
      <NumberFormat
        {...props}
        onValueChange={(values) => {
          handleInputChange({
            target: { name: "value", value: values.floatValue },
          });
        }}
        customInput={CInput}
        decimalSeparator=","
        thousandSeparator="."
        fixedDecimalScale
        displayType="input"
        prefix="R$"
        decimalScale={2}
        placeholder="Apenas números"
        renderText={(value) => <div>{value}</div>}
      />
    </InputContainer>
  ) : (
    <InputContainer
      icon="cash"
      symbol="%"
      label={operationType && "Porcentagem"}
    >
      <NumberFormat
        {...props}
        onValueChange={(values) => {
          handleInputChange({
            target: { name: "value", value: values.floatValue },
          });
        }}
        placeholder="Apenas números"
        customInput={CInput}
        decimalSeparator="."
        fixedDecimalScale
        displayType="input"
        max={100.0}
        min={0.1}
        suffix="%"
        decimalScale={2}
        renderText={(value) => <div>{value}</div>}
      />
    </InputContainer>
  );
}

PriceActionValue.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  operationType: PropTypes.string.isRequired,
};

export default PriceActionValue;
