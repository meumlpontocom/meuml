import React from "react";
import { useSelector } from "react-redux";
import ItemUnit from "./ItemUnit";
import formatMoney from "../../../../helpers/formatMoney";

const ItemsDetailsDefault = ({ id }) => {
  const sales = useSelector(({ shopee }) => shopee.sales);
  const { items } = sales[id];

  return items.map(
    ({ unit_price, title, external_id, secure_thumbnail }, index) => {
      return (
        <div
          key={index}
          className="salescard-items border border-dark rounded p-0 h-100"
        >
          <div className="items-header d-flex mb-3 p-2">
            <p className="salescard-body-title mb-0 flex-grow-1">Items</p>
            <div>
              <p className="mb-0">Total: {formatMoney(unit_price)}</p>
            </div>
          </div>
          <div className="items-body d-flex flex-row flex-wrap px-2 pb-2 align-items-center">
            <ItemUnit
              thumbnail={secure_thumbnail}
              title={title}
              externalId={external_id}
            />
            {items.length > 2 && (
              <div className="items-body-plus border border-dark rounded bg-secondary p-0 d-flex justify-content-center align-items-center ml-auto mr-3">
                <i className="cui cui-plus text-body m-0" />
              </div>
            )}
          </div>
        </div>
      );
    }
  );
};

export default ItemsDetailsDefault;
