import React from "react";
import { useSelector } from "react-redux";
import formatMoney from "../../../../helpers/formatMoney";
import DeliveryDisplay from "../DeliveryDisplay";

const DeliverDetailsComplete = ({ id }) => {
  const sales = useSelector(({ shopee }) => shopee.sales);
  const { shipments } = sales[id];

  return shipments.map((shipment, index) => {
    const {
      shipping_abbreviation,
      shipping_name,
      receiver_street_name,
      receiver_street_number,
      receiver_city,
      receiver_zip_code,
      list_cost,
      status,
      tracking_number,
      tracking_method,
    } = shipment;
    return (
      <div
        key={index}
        className="deliver-details border border-dark rounded p-0 mb-2 mb-xl-0 h-100"
      >
        <div className="sales-header d-flex justify-content-between p-2 items-header">
          <p className="salescard-body-title mb-0">Entrega</p>
          <DeliveryDisplay
            mode={shipping_abbreviation}
            mode_name={shipping_name}
          />
        </div>
        <div className="sales-body p-2">
          <div className="d-flex justify-content-between flex-column mb-2">
            <p className="mb-0 salescard-body-title flex-grow-1">Endereço: </p>
            <p className="mb-0 ">
              {receiver_street_name}, nº {receiver_street_number},{" "}
              {receiver_city}
            </p>
            <p className="mb-0 flex-grow-1">
              CEP:{" "}
              <span className="text-body font-weight-normal">
                {receiver_zip_code}
              </span>
            </p>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-0">
            <p className="mb-0 salescard-body-title">Custos: </p>
          </div>
          <div className="mb-2">
            <p className="mb-0 mr-auto">
              Custo listado: {formatMoney(list_cost)}
            </p>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-0">
            <p className="mb-0 salescard-body-title">Rastreamento: </p>
          </div>
          <div>
            <p className="mb-0 mr-auto">Tipo: {tracking_method}</p>
            <p className="mb-0 mr-auto">Código: {tracking_number}</p>
          </div>
          <div className="mt-2 d-flex justify-content-between align-items-center flex-wrap">
            <p className="mb-0 salescard-body-title d-inline d-md-block d-xl-inline">
              Status:
            </p>
            <p className="mb-0 ml-2 mr-auto">{status}</p>
          </div>
        </div>
      </div>
    );
  });
};

export default DeliverDetailsComplete;
