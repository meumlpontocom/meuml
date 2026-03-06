import React from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";

import RecommendedActionCard from "./RecommendedActionCard";

import "./styles.scss";

export default function RecommendedActions({ actions }) {
  return (
    <Col>
      <Card className="undefined">
        <CardHeader className="px-2">
          <h5 className="text-primary mb-3">
            Ações recomendadas para o anúncio:
          </h5>
        </CardHeader>
        <div className="d-flex flex-wrap px-2">
          <Row className="w-100">
            {actions?.length ? (
              actions.map((action, index) => {
                return <RecommendedActionCard action={action} index={index} />;
              })
            ) : (
              <></>
            )}
          </Row>
        </div>
      </Card>
    </Col>
  );
}
