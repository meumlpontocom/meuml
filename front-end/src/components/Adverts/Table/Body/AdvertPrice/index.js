import React from "react";
import Price from "./Price";
import Status from "./Status";
import SoldQuantity from "./SoldQuantity";
import AvailableQuantity from "./AvailableQuantity";
import { useSelector } from "react-redux";
import { Provider } from "./priceContext";

function AdvertPrice({ price, originalPrice, status, soldQuantity, availableQuantity, externalId }) {
  const components = useSelector(state => state.components);
  const statusStatus = components.components.filter(x => x.code === "status");
  const soldQuantityStatus = components.components.filter(x => x.code === "sold_quantity");
  const availableQuantityStatus = components.components.filter(x => x.code === "available_quantity");

  return (
    <Provider value={{ render: true, status, externalId }}>
      <td id="price" name="price" style={{ verticalAlign: "middle" }}>
        <Price value={price} originalPrice={originalPrice} />
        <SoldQuantity render={soldQuantityStatus[0].status} amount={soldQuantity} />
        <AvailableQuantity render={availableQuantityStatus[0].status} amount={availableQuantity} />
        <Status render={statusStatus[0].status} status={status} externalId={externalId} />
      </td>
    </Provider>
  );
}

export default AdvertPrice;
