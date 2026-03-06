import React from "react";
import Widget04 from "../../widgets/Widget04";
import { Data } from "../../../containers/Data";
import { Col, Row } from "reactstrap";
import "./index.css";

const getValue = props => {
  const { negative, neutral, positive } = props;
  if (negative > positive) {
    const newData = String(negative).substring(2);
    return newData;
  } else if (negative < positive) {
    const newData = String(positive).substring(2);
    return newData;
  } else if (neutral > positive && neutral > negative) {
    const newData = String(neutral).substring(2);
    return newData;
  }
};

const cardConfig = props => {
  const { negative, neutral, positive } = props;
  let color = "";
  if (negative > positive) color = "danger";
  else if (positive > negative) color = "success";
  else if (neutral > positive && neutral > negative) color = "warning";
  return {
    content: `Positivas: ${displayCardValues(
      positive
    )}% | Neutras: ${displayCardValues(
      neutral
    )}% | Negativas: ${displayCardValues(negative)}%`,
    value: getValue({ negative, neutral, positive }),
    color: color
  };
};

const displayCardValues = value => {
  if (value === 0) return 0;
  else if (value === "0.0" || value === "0.00") return 0;
  else if (value === 1 || value === "1") return "100";
  else return value.toString().substring(2);
};

const Rating = () => {
  return (
    <Data.Consumer>
      {provider => {
        let negative =
          provider.state.selectedAccount.external_data.seller_reputation
            .transactions.ratings.negative;
        let neutral =
          provider.state.selectedAccount.external_data.seller_reputation
            .transactions.ratings.neutral;
        let positive =
          provider.state.selectedAccount.external_data.seller_reputation
            .transactions.ratings.positive;
        let config = cardConfig({ negative, neutral, positive });
        return provider.state.isLoading ? (
          <p>Carregando ...</p>
        ) : provider.state.accountsFound > 0 ? (
          <Col sm="12" xs="12" md="12" lg="6">
            <Widget04
              icon="cui-thumb-up cui-sm"
              color={config.color}
              header="Avaliações"
              value={config.value}
            >
              {config.content}
            </Widget04>
          </Col>
        ) : (
          <div />
        );
      }}
    </Data.Consumer>
  );
};

export default Rating;
