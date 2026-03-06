import React from "react";
import { useSelector } from "react-redux";
import { CBadge } from "@coreui/react";
import DeliveryDisplay from "../DeliveryDisplay";

const DeliverDetailsDefault = ({ id }) => {
  const { sales } = useSelector((state) => state.sales);
  const { shipments } = sales[id];

  return shipments.map((shipment) => {
    return (
      <div
        key={id}
        className="deliver-details border border-dark rounded d-flex justify-content-between align-items-center p-2 mb-2 mb-xl-0"
      >
        <p className="salescard-body-title mb-0">Entrega</p>
        <p className="mb-0 d-block">
          {shipment.status}<br/>
          <CBadge color="info">{shipment.substatus}</CBadge>
        </p>
        <DeliveryDisplay
          mode={shipment.shipping_abbreviation}
          mode_name={shipment.shipping_name}
        />
      </div>
    );
  });
};

export default DeliverDetailsDefault;
