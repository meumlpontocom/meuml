import React from "react";

export default function Discount({ tags, originalPrice }) {
  const discountTagString = "loyalty_discount_eligible";
  const anyDiscountApplied = () => originalPrice !== null;
  const eligibleForDiscount = tags.filter(tag => tag === discountTagString)
    .length;
  const style = {
    marginLeft: "5px",
    color: eligibleForDiscount ? "#1c5fc9" : "#b02b13"
  };

  if (anyDiscountApplied()) {
    return (
      <span style={{ ...style }}>
        <strong>% </strong>Desconto Aplicado
      </span>
    );
  }

  return eligibleForDiscount ? (
    <span style={{ ...style }}>
      <strong>% </strong>Elegível para Desconto
    </span>
  ) : (
    <span style={{ ...style }}>
      <strong>% </strong>Não Elegível Para Desconto
    </span>
  );
}
