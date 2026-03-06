import React from "react";
import PropTypes from "prop-types";
import Label from "reactstrap/lib/Label";

function CustomLabel({ id, name }) {
  return (
    <Label id={`label-${id}`} htmlFor={`select-${id}`}>
      {name}
    </Label>
  );
}

CustomLabel.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
};

export default CustomLabel;
