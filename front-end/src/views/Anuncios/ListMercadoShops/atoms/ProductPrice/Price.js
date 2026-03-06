import React        from "react";

import { SpanPrice } from "./styles";

const Price = ({ value }) => {

  const priceFormatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    style: "currency",
    currency: "BRL"
  })

  return (
    <SpanPrice>{priceFormatted}</SpanPrice>
  ) 
};

export default Price;
