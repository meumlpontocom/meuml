import React from "react";
import { Col, Row } from "reactstrap";
import TipsBadge from "./TipsBadge";

export default function DetailsAndDescription() {
  return (
    <Col
      sm="12"
      md="12"
      lg="12"
      xs="12"
      style={{ color: "gray", marginTop: "2.3em" }}
    >
      <h4 style={{ color: "#9D9D9D", marginBottom: "1.7em" }}>
        <i className="cil-caret-right mr-1" />
        <span>{"Descrição & Detalhes".toUpperCase()}</span>
      </h4>
      <Row>
        <Col sm="12" md="6" lg="6" xs="12">
          <div className="list-group list-group-accent">
            <TipsBadge>
              As visualizações são capturadas durante a madrugada, indicando o
              total do dia anterior. Por isso, para saber a quantidade
              visualizações de hoje será necessário conferir amanhã.
            </TipsBadge>
          </div>
        </Col>
      </Row>
    </Col>
  );
}
