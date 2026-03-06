import React from "react";
import Col from "reactstrap/lib/Col";
import PropTypes from "prop-types";

function CustomCallout({ value, label, color }) {
  return (
    <Col xs="12" sm="4" md="3" lg="3">
      <div className={`callout callout-${color}`}>
        <small className="text-muted">{label}</small>
        <br />
        <strong className="h4">{value}</strong>
      </div>
    </Col>
  );
}

CustomCallout.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  color: PropTypes.string,
};

export default CustomCallout;
