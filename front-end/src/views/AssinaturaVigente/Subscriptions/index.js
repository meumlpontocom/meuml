import React from "react";
import Body from "./Body";
import Header from "./Header";
import { Col, Row, Card } from "reactstrap";
import NoSubscriptionCard from "./NoSubscriptionCard";
import formatMoney from "../../../helpers/formatMoney";

export default function Subscriptions({ subscription, modules }) {
  const createPack = ({ modulesNames }) => {
    let array = [];
    modulesNames.split(",").map((name) => {
      array.push({ list: modules.filter(() => name) });
      return name;
    });
    return array;
  };

  return (
    <Col sm="12" md="12" lg="12" xs="12">
      <Row>
        {subscription.length !== 0 ? (
          subscription.map((sub, index) => {
            return (
              <Col key={index} xs={12} lg={6}>
                <Card>
                  <Header
                    price={formatMoney(sub.price)}
                    name={sub.package_name.toUpperCase()}
                    accounts={sub.accounts}
                    expirationDate={sub.expiration_date}
                  />
                  <Body
                    subscription={subscription}
                    modules={modules}
                    packageName={sub.package_name.toUpperCase()}
                    packs={createPack({ modulesNames: sub.modules_names })}
                    index={index}
                    id={sub.id}
                  />
                </Card>
              </Col>
            );
          })
        ) : (
          <NoSubscriptionCard />
        )}
      </Row>
    </Col>
  );
}
