import React from "react";
import { useSelector } from "react-redux";
import formatMoney from "../../../../helpers/formatMoney";

const ItemUnitComplete = ({ id }) => {
  const { sales } = useSelector(state => state.sales);
  const { items } = sales[id];
  return items.map(({ title, quantity, unit_price, id, secure_thumbnail }, index) => {
    return (
      <tbody key={index}>
        <tr>
          <td colSpan="2">
            <div className="d-flex">
              <div className="item-unit-picture">
                {secure_thumbnail ? (
                  <img width={50} src={secure_thumbnail} alt="Capa" className="mr-2" />
                ) : (
                  <></>
                )}
              </div>
              <div className="flex-grow-1">
                <p className="salescard-body-title mb-0">{title}</p>
                <p className="mb-0">{id}</p>
              </div>
            </div>
          </td>
          <td>
            <p>{quantity}</p>
          </td>
          <td>
            <p>{formatMoney(unit_price)}</p>
          </td>
        </tr>
      </tbody>
    );
  });
};

export default ItemUnitComplete;
