import React from "react";

import { Row, Col } from "reactstrap";

import DeliverDetailsComplete from "./DeliverDetailsComplete";
import PaymentDetailsComplete from "./PaymentDetailsComplete";
import BuyersDetailsComplete from "./BuyersDetailsComplete";
import ItemsDetailsComplete from "./ItemsDetailsComplete";

import "./styles.scss";

const SalesComplete = ({ id }) => {
  return (
    <Row>
      <Col sm="12" md="12" lg="6" xl="5">
        <Row>
          <Col
            sm="12"
            md="6"
            lg="12"
            xl="6"
            className="pr-3 pr-lg-3 pr-xl-1 mb-2 mb-md-0 mb-lg-2 mb-xl-0"
          >
            <DeliverDetailsComplete id={id} />
          </Col>
          <Col sm="12" md="6" lg="12" xl="6" className="pl-3 pl-lg-3 pl-xl-1">
            <PaymentDetailsComplete id={id} />
          </Col>
          <Col sm="12">
            <BuyersDetailsComplete id={id} />
          </Col>
        </Row>
      </Col>
      <Col sm="12" md="12" lg="6" xl="7" className="mx-0 pl-lg-0">
        <ItemsDetailsComplete id={id} />
      </Col>
    </Row>
  );
};

export default SalesComplete;
