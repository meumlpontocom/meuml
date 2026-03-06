import React from "react";

import Price                from "./Price";
import SoldQuantity         from "./SoldQuantity";
import AvailableQuantity    from "./AvailableQuantity";
import StatusBtn            from "../ProductButtons/StatusBtn";

function ProductPrice({
  price,
  status,
  soldQuantity,
  availableQuantity,
  externalId
}) {

  return (
    <td id="price" name="price" style={{ verticalAlign: "middle" }}>
      <Price value={price} />
      <SoldQuantity
        amount={soldQuantity}
      />
      <AvailableQuantity
        amount={availableQuantity}
      />
      <StatusBtn
        status={status}
        externalId={externalId}
      />
    </td>
  );
}

export default ProductPrice;
