import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardText } from "reactstrap";

const WarningCard = ({ type, children }) => {
  return (
    <Card className={`${type} ${type}-container mt-5`}>
      <CardBody className="d-flex p-0 align-items-center bg-gradient">
        <div
          className={`mt-0 mb-0 mr-3 text-white bg-${type} p-4 icon-container`}
        >
          <i className="cil-warning" />
        </div>
        <div className="p-2 text-container">
          <CardText>{children}</CardText>
        </div>
      </CardBody>
    </Card>
  );
};

WarningCard.propTypes = {
  type: PropTypes.string,
  children: PropTypes.func,
};

export default WarningCard;
