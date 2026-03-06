import React from "react";
import {Card, CardBody, CardText} from "reactstrap";
import "./WarningMessage.css";
import {Link} from "react-router-dom";

const WarningMessage = () => {
  return (
    <Card className="warning warning-container">
      <CardBody className="d-flex p-0 align-items-center bg-gradient">
        <div className="mt-0 mb-0 mr-3 text-white bg-warning p-4 icon-container">
          <i className="cil-warning"/>
        </div>
        <div className="p-2 text-container">
          <CardText className="mb-1">
            Nenhuma das assinaturas disponíveis contempla o recurso de replicação de anúncios. A replicação de anúncios
            é feita com Créditos.
          </CardText>
          <CardText>
            Você pode adquirir créditos para a replicação, <Link to="/creditos/comprar">clicando aqui</Link>.
          </CardText>
        </div>
      </CardBody>
    </Card>
  );
};

export default WarningMessage;
