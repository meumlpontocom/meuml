import React from "react";
import NumberFormat from "react-number-format";
import { Input, InputGroup, InputGroupAddon, InputGroupText } from "reactstrap";

export function MonetaryFormate({
  inputRef,
  onChange,
  title = "+ / - em R$",
  footer = "Valor - ou +",
  ...props
}) {
  return (
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>{title}</InputGroupText>
      </InputGroupAddon>
      <NumberFormat
        {...props}
        getInputRef={inputRef}
        onValueChange={values => {
          onChange(values.floatValue);
        }}
        customInput={Input}
        decimalSeparator=","
        thousandSeparator="."
        fixedDecimalScale
        displayType="input"
        prefix="R$"
        decimalScale={2}
        renderText={value => <div>{value}</div>}
      />
    </InputGroup>
  );
}

export function PercentFormate({
  inputRef,
  onChange,
  title = "+ / - em %",
  footer = "Valor - ou +",
  ...props
}) {
  return (
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>{title}</InputGroupText>
      </InputGroupAddon>
      <NumberFormat
        {...props}
        getInputRef={inputRef}
        customInput={Input}
        suffix="%"
        onValueChange={values => {
          onChange(values.floatValue);
        }}
        displayType="input"
      />
    </InputGroup>
  );
}
