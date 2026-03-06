import React     from "react";
import PropTypes from "prop-types";

function SplitPercentage({ type, value }) {
  const Type = () => (
    type === "meli"
      ? <span>Custo do Mercado Livre:&nbsp;</span>
      : <span>Seu custo:&nbsp;</span>
  );
  return (
    <p>
      <Type />{value}&nbsp;%
    </p>
  );
}

SplitPercentage.propTypes = {
  type: PropTypes.string.isRequired,
  value: PropTypes.string
}

export default SplitPercentage;
