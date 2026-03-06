import React from "react";

const DeliveryBadge = ({ mode }) => {
  return (
    <div className="mb-0 p-1 d-flex align-items-center delivery-badge">
      <p className="mb-0">{mode}</p>
    </div>
  );
};

export default DeliveryBadge;
