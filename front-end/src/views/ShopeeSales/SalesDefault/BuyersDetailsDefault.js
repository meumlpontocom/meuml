import React from "react";
import { useSelector } from "react-redux";

const BuyersDetailsDefault = ({ id }) => {
  const sales = useSelector(({ shopee }) => shopee.sales);
  const sale = sales[id];
  return (
    <div className="buyer-details border border-dark rounded p-2 mt-2 d-flex justify-content-between align-items-center mb-2 mb-lg-0">
      <p className="mb-0 salescard-body-title">Comprador</p>
      <div className="flex-grow-1 ml-2">
        <p className="mb-0 mx-auto">
          <span>{sale?.sale?.buyer_nickname}</span>
        </p>
      </div>
      <p className="mb-0 salescard-body-title ">ID</p>
      <div className="flex-grow-1 ml-2">
        <p className="mb-0 mx-auto">
          <span>{sale?.sale?.buyer_id}</span>
        </p>
      </div>
    </div>
  );
};

export default BuyersDetailsDefault;
