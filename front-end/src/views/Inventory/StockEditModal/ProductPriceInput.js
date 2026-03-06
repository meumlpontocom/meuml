import React from "react";
import {
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
} from "@coreui/react";
import NumberFormat from "react-number-format";

const ProductPriceInput = ({ price, setPrice, label }) => {
  return (
    <CInputGroup>
      <CInputGroupPrepend>
        <CInputGroupText className={"bg-gradient-primary text-white"}>
          <label htmlFor="update-stock-input">{label}</label>
        </CInputGroupText>
      </CInputGroupPrepend>
      <NumberFormat
        onValueChange={({ floatValue }) => setPrice(floatValue)}
        placeholder="Digite apenas numeros"
        customInput={CInput}
        decimalSeparator=","
        thousandSeparator="."
        fixedDecimalScale
        displayType="input"
        prefix="R$"
        decimalScale={2}
        renderText={(value) => <div>{value}</div>}
        name="product-price"
        id="product-price"
      />
    </CInputGroup>
  );
};

export default ProductPriceInput;
