/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";

const Blockades = props => {
  const [blockades, setBlockades] = useState([]);
  const [fetch, setFetch] = useState(false);

  return (
    <Container>
      <Row>
        {fetch ? (
          blockades.map(blockade => (
            <Col md="4">
              <Card>
                <CardBody>
                  <h5>
                    <small>
                      <b>Nome da Conta: </b>
                    </small>
                    {blockade.accountName}
                  </h5>
                  <h5>
                    <small>
                      <b>ID da Conta: </b>
                    </small>
                    {blockade.accountId}
                  </h5>
                  <h5>
                    <small>
                      <b>Data do Bloqueio: </b>
                    </small>
                    {blockade.dateBlocked}
                  </h5>
                  <Button color="success">Desbloquear</Button>
                </CardBody>
              </Card>
            </Col>
          ))
        ) : (
          <></>
        )}
      </Row>
    </Container>
  );
};

export default Blockades;
