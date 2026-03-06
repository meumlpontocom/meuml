import React from "react";
import { Col } from "reactstrap";

export default function Title({ text, id }) {
  return (
    <Col style={{ padding: "5px 5px" }} sm="12" md="12" lg="12" xs="12">
      <strong>
        <span style={{ fontSize: 21, color: "#000" }}>{text}</span>
      </strong>{" "}
      <span style={{ fontSize: 14, color: "#20A8D8" }}>{id}</span>
    </Col>
  );
}
