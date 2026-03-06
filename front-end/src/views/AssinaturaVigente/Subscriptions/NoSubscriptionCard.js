import React from "react";
import { Card, CardBody } from "reactstrap";
export default function NoSubscriptionCard() {
  return (
    <Card className="card card-accent-danger mt-3">
      <CardBody>
        <span className="h5">
          Sua conta ainda não possui nenhuma assinatura.
        </span>
      </CardBody>
    </Card>
  );
}
