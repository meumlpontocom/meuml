import React from "react";
import { Row, Col } from "reactstrap";
import DeliverDetailsDefault from "./DeliverDetailsDefault";
import PaymentDetailsDefault from "./PaymentDetailsDefault";
import BuyersDetailsDefault from "./BuyersDetailsDefault";
import ItemsDetailsDefault from "./ItemsDetailsDefault";
import "./styles.scss";

const SalesDefault = ({ id }) => {
  return (
    <Row>
      <Col sm="12" md="12" lg="6" xl="5">
        <Row>
          <Col sm="12" md="6" lg="12" xl="6" className="pr-3 pr-lg-3 pr-xl-1">
            <DeliverDetailsDefault id={id} />
          </Col>
          <Col sm="12" md="6" lg="12" xl="6" className="pl-3 pl-lg-3 pl-xl-1">
            <PaymentDetailsDefault id={id} />
          </Col>
          <Col sm="12">
            <BuyersDetailsDefault id={id} />
          </Col>
        </Row>
      </Col>
      <Col sm="12" md="12" lg="6" xl="7" className="mx-0 pl-lg-0">
        <ItemsDetailsDefault id={id} />
      </Col>
    </Row>
  );
};

export default SalesDefault;
