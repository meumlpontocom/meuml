import React from "react";
import PropTypes from "prop-types";
import "./index.css";

function DataText({ label, text, icon, color }) {
  return (
    <p className={`text-${color || "dark"} table-data-text mt-1`}>
      <i className={`cil-${icon} mr-1`} />
      {label}: {text}
    </p>
  );
}

DataText.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string,
};

export default DataText;
