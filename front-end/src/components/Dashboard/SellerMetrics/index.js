import React from "react";
import { Data } from "../../../containers/Data";
import Widget from "../../widgets/Widget02";
import { Col, Row } from "reactstrap";
import Rating from "../Rating";

const SellerMetrics = () => {
  return (
    <Data.Consumer>
      {provider => {
        let { period } = provider.state.selectedAccount.external_data.seller_reputation.metrics.sales;
        return (
          <>
            <Title period={period} />
            <CardsContainer provider={provider.state} />
          </>
        );
      }}
    </Data.Consumer>
  );
};

const CardsContainer = props => {
  function fixPercentage(value) {
    return value.toLocaleString('pt-BR', {
      style: 'percent',
      maximumSignificantDigits: 3
    });
  }
  const provider = props.provider;
  return (
    <Row>
      <Card
        header="Atrasos"
        body={fixPercentage(provider.selectedAccount.external_data.seller_reputation.metrics.delayed_handling_time.rate)}
        icon="fa fa-hourglass-2"
        color="secondary"
        variant={0}
      />
      <Card
        header="Reclamações"
        body={fixPercentage(provider.selectedAccount.external_data.seller_reputation.metrics.claims.rate)}
        icon="fa fa-thumbs-down"
        color="warning"
        variant={0}
      />
      <Card
        header="Mediações"
        body={fixPercentage(provider.selectedAccount.external_data.seller_reputation.metrics.sales.completed)}
        icon="fa fa-support"
        color="info"
        variant={0}
      />
      <Card
        header="Cancelamentos"
        body={fixPercentage(provider.selectedAccount.external_data.seller_reputation.metrics.cancellations.rate)}
        icon="fa fa-times-circle-o"
        color="danger"
        variant={0}
      />
      <Rating />
    </Row>
  );
};

const Card = props => {
  return (
    <Col sm="6" md="6" lg="6" xs="12">
      <Widget
        header={props.header}
        mainText={props.body}
        icon={props.icon}
        color={props.color}
        variant={props.variant}
      />
    </Col>
  );
};
const Title = props => {
  let period = "últimos 4";
  if (props.period === "60 months") period = "últimos 60";
  return <h5>Considerando os {period} meses.</h5>;
};

export default SellerMetrics;
