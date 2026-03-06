import React from "react";

export default function FreeShipping({ status, shipping }) {
  return status ? (
    <span style={{ marginLeft: "5px", color: shipping === "1" ? "#17660b" : "#b02b13" }}>
      <i className="cil-truck mr-1" />
      {shipping === "1" ? "Frete Grátis" : "Sem Frete Grátis"}
    </span>
  ) : null;
}
