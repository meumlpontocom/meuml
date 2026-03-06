import React from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import CardHeader from "reactstrap/lib/CardHeader";
import { useSelector } from "react-redux";
import ThumbWithTitle from "./ThumbWithTitle";
import RecommendedActions from "./RecommendedActions";

import QualityChart from "./QualityChart";

export default function Header({ secureThumbnail, title }) {
  const { id, actions } = useSelector((store) => store.qualityDetails);
  return (
    <CardHeader className="pb-0">
      <Row>
        <Col xs="12" md="6">
          <ThumbWithTitle
            id={id}
            title={title}
            secureThumbnail={secureThumbnail}
          />
        </Col>
        <Col xs="12" md="6">
          <QualityChart />
        </Col>
      </Row>
      <Row>
        <RecommendedActions actions={actions} />
      </Row>
    </CardHeader>
  );
}
