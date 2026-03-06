import React from "react";
import PropTypes from "prop-types";

function VariationArrow({ variation }) {
  if (typeof variation !== "string") return <></>;
  return variation === "N/A" ? (
    ""
  ) : Number(variation?.split("%")[0]) > 0 ? (
    <i className="cil-arrow-top mr-0 mr-sm-2 d-inline d-lg-none d-xl-inline" />
  ) : Number(variation?.split("%")[0]) === 0 ? (
    ""
  ) : (
    <i className="cil-arrow-bottom mr-0 mr-sm-2 d-inline d-lg-none d-xl-inline" />
  );
}

VariationArrow.propTypes = {
  variation: PropTypes.string,
};

export default VariationArrow;
