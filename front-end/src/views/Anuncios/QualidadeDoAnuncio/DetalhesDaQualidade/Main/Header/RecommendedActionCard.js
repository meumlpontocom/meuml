import React from "react";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import CardBody from "reactstrap/lib/CardBody";

const RecommendedActionCard = ({ index, action }) => {
  return (
    <Col sm="12" md="6" lg="4" className="recommendations-card">
      <Card key={index} id={action.id} name={action.name} className="info">
        <CardBody className="d-flex align-items-center p-2">
          <div className="mr-3 text-white bg-warning p-2">
            <i className="cil-warning" />
          </div>
          <div>
            <div className="text-muted font-weight-bold">
              <p className="m-0">
                {index + 1}. {action.description}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default RecommendedActionCard;
