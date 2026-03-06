import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

function ToggleController({ hiddenValue, children }) {
  const { toggleAttributes } = useSelector(({ editAdvert }) => editAdvert);
  return hiddenValue !== toggleAttributes ? children : <></>;
}

ToggleController.propTypes = {
  hiddenValue: PropTypes.bool,
};

export default ToggleController;
