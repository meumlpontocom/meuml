import React from "react";
import Col from "reactstrap/lib/Col";
import PropTypes from "prop-types";

function Callout({ color, title, value, col, borders }) {
  return (
    <Col {...col}>
      <div
        className={`callout callout-${color} ${
          !borders ? "" : "b-t-1 b-r-1 b-b-1"
        }`}
      >
        <small className="text-muted">{title}</small>
        <br />
        <strong className="h5">{value}</strong>
      </div>
    </Col>
  );
}

Callout.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.any,
  col: PropTypes.object,
  borders: PropTypes.bool,
}

export default Callout;
