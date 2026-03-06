import React from "react";
import { useSelector } from "react-redux";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import CardBody from "reactstrap/lib/CardBody";
import NotConcludedGoals from "./NotConcludedGoals";
import ConcludedGoals from "./ConcludedGoals";

export default function Body({ history }) {
  const { goals } = useSelector((state) => state.qualityDetails);
  const applicableGoals = goals.filter((goal) => goal.apply === true);
  return (
    <CardBody className="pt-0">
      <Row>
        <Col>
          <Card className="brand-card">
            <CardBody className="row">
              <Col sm="12" md="6">
                <NotConcludedGoals
                  history={history}
                  applicableGoals={applicableGoals}
                />
              </Col>
              <Col sm="12" md="6">
                <ConcludedGoals applicableGoals={applicableGoals} />
              </Col>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </CardBody>
  );
}
