import React from "react";
import Blockades from "../Blockades";
import { Data } from "../../../containers/data/admin/AdminContainer";
import { Button, ButtonGroup, Card, CardHeader, CardBody, CardFooter, Container } from "reactstrap";

const ControlPanel = props => (
  <Data.Consumer>
    {provider => (
      <Container>
        <Card>
          <CardHeader>
            <ButtonGroup>
              <Button onClick={() => provider.unblockAll()} color="primary">
                Desbloquear Todos
              </Button>
              {/* <Button onClick={() => provider.listAllBlockades()} color="secondary">Listar Bloqueios</Button> */}
              <Button title="Console Log Admin Page State" color="secondary">
                LOG
              </Button>
            </ButtonGroup>
          </CardHeader>
          <CardBody>
            <Blockades fetch={provider.state.listAllBlockades} />
          </CardBody>
          <CardFooter></CardFooter>
        </Card>
      </Container>
    )}
  </Data.Consumer>
);

export default ControlPanel;
