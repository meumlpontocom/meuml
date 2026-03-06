import React     from "react";
import PropTypes from "prop-types";

const PromotionDate = ({ label, date }) => (
  date
    ? <p>{label}&nbsp;{new Date(date).toLocaleDateString("pt-BR")}</p>
    : <p>N/A</p>
);

PromotionDate.propTypes = {
  label: PropTypes.string.isRequired,
  date: PropTypes.string
}

export default PromotionDate;
