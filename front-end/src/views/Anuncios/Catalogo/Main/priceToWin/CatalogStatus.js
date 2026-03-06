import React from "react"
import PropTypes from "prop-types"
import PriceToWinData from "./PriceToWinData";

const CatalogStatus = ({ value }) => (
  <span className="ml-2">
    <PriceToWinData
      icon="bell-exclamation"
      label="Status em catálogo"
      value={value}
    />
  </span>
);

CatalogStatus.propTypes = {
  value: PropTypes.string
}

export default CatalogStatus

