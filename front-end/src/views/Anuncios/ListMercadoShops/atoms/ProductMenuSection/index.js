import React from "react";
import ProductOptionsBtn from "../../molecules/ProductOptions/index";

export default function ProductMenuSection({ product, history }) {

  return (
    <td
      style={{
        verticalAlign: "middle",
        minWidth: "100px",
        justifyContent: "space-around",
      }}
      className="options-container"
    >
      <ProductOptionsBtn
        advertId={product.external_id}
        ad={product}
        history={history}
      />
    </td>
  );
}
