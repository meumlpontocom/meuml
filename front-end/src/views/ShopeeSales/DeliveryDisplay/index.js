import React, { useState } from "react";
import DeliveryBadge from "./DeliveryBadge";
import DeliveryTag from "./DeliveryTag";
import "./styles.scss";

const DeliverDisplay = ({ mode, mode_name }) => {
  const [display, setDisplay] = useState(false);

  return (
    <div
      className="delivery-display-container"
      onMouseEnter={() => setDisplay(true)}
      onMouseLeave={() => setDisplay(false)}
    >
      {display && <DeliveryTag text={mode_name} />}
      <DeliveryBadge mode={mode} />
    </div>
  );
};

export default DeliverDisplay;
