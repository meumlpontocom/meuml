/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import formatMoney from "../../../helpers/formatMoney";
import {
  Col,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  ListGroupItemText,
  ListGroupItemHeading,
} from "reactstrap";

export default function ModulesCatalogue({ modules }) {
  const [toggle, setToggle] = useState({});
  useEffect(() => {
    modules.map((m, index) =>
      setToggle({
        [index]: false,
      }),
    );
  }, []);
  return (
    <Col xs={12} lg={5}>
      <ListGroup>
        <ListGroupItemHeading>
          <span className="title">CATÁLOGO DE ASSINATURAS</span>
        </ListGroupItemHeading>
        {modules.map((module, index) => {
          return (
            <>
              <ListGroupItem
                key={index}
                onClick={() =>
                  setToggle({
                    ...toggle,
                    [index]: !toggle[index],
                  })
                }
                className={`h5 pointer list-group-item-action flex-column align-items-start ${
                  toggle[index] ? "active" : ""
                }`}
              >
                <ListGroupItemText>
                  <span>{module.title}</span>
                  <span style={{ float: "right" }}>
                    {module.price === 0 ? "Grátis" : formatMoney(module.price)}
                  </span>
                </ListGroupItemText>
              </ListGroupItem>
              {toggle[index] ? (
                <Card className="card-accent-secondary animated fadeIn">
                  <CardBody>{module.description}</CardBody>
                </Card>
              ) : (
                <></>
              )}
            </>
          );
        })}
      </ListGroup>
    </Col>
  );
}
