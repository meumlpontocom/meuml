import React from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Title from "./Title";
import Price from "./Price";
import AvailableQuantity from "./Available";
import Condition from "./Condition";
import ListingType from "./ListingType";
import FreeShipping from "./FreeShipping";
import CatalogListing from "./CatalogListing";

export default function AdvertDetails({ id }) {
  return (
    <Row>
      <Col xs={12} sm={12} md={12} lg={12}>
        <Title id={id} />
      </Col>
      <Col xs={12}>
        <ListingType id={id} />
        <FreeShipping id={id} />
        <Price id={id} />
      </Col>
      <Col xs={12}>
        <CatalogListing id={id} />
        <Condition id={id} />
        <AvailableQuantity id={id} />
      </Col>
    </Row>
  );
}
