import React     from "react";
import PropTypes from "prop-types";

const PromotionTitle = ({ name }) => (
  <h4 className="mb-0 text-info">
    Ativar promoção "<strong>{name}</strong>"
  </h4>
);

PromotionTitle.propTypes = {
  name: PropTypes.string.isRequired,
}

export default PromotionTitle;
