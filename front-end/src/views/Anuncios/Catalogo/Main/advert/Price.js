import React from "react";
import formatMoney from "../../../../../helpers/formatMoney";

export default function Price({ price }) {
  return (
    <>
      <span className="text-muted ml-1">
        <i className="cil-cash mr-1" />
        Preço: {formatMoney(price)}
      </span>
      <br />
    </>
  );
}
