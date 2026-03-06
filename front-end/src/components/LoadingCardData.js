import React from "react";
import { Col, Row } from "reactstrap";
import Loading from "react-loading";

export default function LoadingCardData({ color }) {
  return (
    <Row style={{ justifyContent: "center" }}>
      <Col
        sm={{ size: "auto" }}
        md={{ size: "auto" }}
        lg={{ size: "auto" }}
        xs={{ size: "auto" }}
      >
        <Loading
          type="bars"
          color={color || "#054785"}
          height={50}
          width={50}
        />
      </Col>
    </Row>
  );
}
