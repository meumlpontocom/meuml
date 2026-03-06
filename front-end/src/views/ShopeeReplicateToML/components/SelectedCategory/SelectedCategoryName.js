import React                     from "react";
import PropTypes                 from "prop-types";
import { FaArrowAltCircleRight } from "react-icons/fa";

const SelectedCategoryPath = ({ name }) =>
  name ? (
    <h4>
      <FaArrowAltCircleRight className="mb-1" />&nbsp;
      {name.toUpperCase()}
    </h4>
  ) : <></>;

SelectedCategoryPath.propTypes = {
  name: PropTypes.string.isRequired,
};

export default SelectedCategoryPath;
