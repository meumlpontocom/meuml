import React from "react";
import { useSelector } from "react-redux";
import salesIcon from "../../../assets/img/icons/icone_vendas.svg";

export default function AccountSales({ id }) {
  const totalOrders = useSelector(
    ({ accounts }) => accounts.accounts[id]?.total_orders
  );
  return (
    <div className="sales-badge d-inline-flex align-items-center border-details">
      <div className="badge-icon d-flex justify-content-center align-items-center m-0 p-0">
        <img src={salesIcon} alt="ícone de vendas" className="img-responsive" />
      </div>
      <p className="ml-2 my-0">Vendas</p>
      <span className="ml-auto mr-3">{totalOrders}</span>
    </div>
  );
}
