import { useSelector } from "react-redux";
import CardHeader from "reactstrap/lib/CardHeader";
import Col from "reactstrap/lib/Col";
import Row from "reactstrap/lib/Row";
import ReplicateMlAdvertsBtn from "src/components/ReplicateMlAdvertsBtn";

export default function AdvertsHeader() {
  const adverts = useSelector(state => state.advertsReplication?.adverts);

  return adverts.length ? (
    <CardHeader>
      <Row className="mt-3 mb-3">
        <Col xs={12} sm={4} md={4} lg={4} xl={3} className="mb-3">
          <ReplicateMlAdvertsBtn />
        </Col>
      </Row>
    </CardHeader>
  ) : (
    <></>
  );
}
