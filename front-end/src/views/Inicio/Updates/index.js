import React from "react";
import { Card, CardBody, CardHeader, Col } from "reactstrap";

const Updates = ({ className, color, title, style, header, children, md }) => (
  <Col className="animated fadeIn" md={ md } key={ title }>
    <Card
      className={ className }
      color={ color }
      title={ title }
      style={ style }
    >
      <CardHeader>
        <small>{ header }</small>
      </CardHeader>
      <CardBody>
        <h5>
          { children }
        </h5>
      </CardBody>
    </Card>
  </Col>
);

export default Updates;