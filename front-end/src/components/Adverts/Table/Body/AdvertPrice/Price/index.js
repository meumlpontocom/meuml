import React from "react";

const Price = ({ value, originalPrice }) => {
  if (originalPrice !== null) {
    return (
      <>
        <p>
          <span style={{
            fontSize: "12px",
            color: "#000",
            fontWeight: "bold",
            margin: "0px 5px 0px 0px"
          }}>
            {value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              style: "currency",
              currency: "BRL"
            })}
          </span>
          <span style={{
            fontSize: "10px",
            color: "#777",
            marginLeft: "25px",
            margin: "0px 0px 0px 0px"
          }}>
            <strike>
              {originalPrice.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                style: "currency",
                currency: "BRL"
              })}
            </strike>
          </span>
        </p>
      </>
    );
  }

  return value ? (
    <span style={{ fontSize: "12px", color: "#000", fontWeight: "bold" }}>
      {value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        style: "currency",
        currency: "BRL"
      })}
    </span>
  ) : (
    <p>
      <b>Valor a combinar</b>
    </p>
  );
};

export default Price;
