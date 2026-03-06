import React from "react"
import PropTypes from "prop-types"

const PriceToWinData = ({ label, value, icon }) => {
  const textColor = value === "Ganhando"
    ? "text-success"
    : value === "Perdendo"
      ? "text-danger"
      : value === "Compartilhando o primeiro lugar"
        ? "text-warning"
        : "text-dark";

  return value ? (
    <span className={`mr-2 ${textColor}`}>
      <i className={`cil-${icon} mr-1`} />
      {label}:&nbsp;{value}
    </span>
  ) : <></>;
}

PriceToWinData.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  icon: PropTypes.string,
}

export default PriceToWinData;
