import React from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import { AdvertId, AdvertTitle, AdvertPositioning } from "../imports";
import ImageQuality from "../ImageQuality";

export default function AdvertDetails({ title, id, account, position, picturesStatus }) {
  return (
    <td>
      <Row>
        <Col sm="12" md="12" lg="12" xs="12">
          <AdvertTitle title={title} account={account} />
          <AdvertId id={id} />
          <AdvertPositioning position={position} />
          <ImageQuality quality={picturesStatus} />
        </Col>
      </Row>
    </td>
  );
}
