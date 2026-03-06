import React from "react";

import { Card, CardBody, CardText } from "reactstrap";

import "./styles.scss";

const PaymentWarningMessage = () => {
  return (
    <Card className="warning warning-container">
      <CardBody className="d-flex p-0 align-items-center bg-gradient">
        <div className="mt-0 mb-0 mr-3 text-white bg-warning p-4 icon-container">
          <i className="cil-warning" />
        </div>
        <div className="p-2 text-container">
          <CardText className="mb-1">
            Após o pagamento realizado, não é possível cancelar a
            assinatura/compra. Só efetue o pagamento se estiver ciente sobre
            como funciona o serviço. Não é possível fazer devolução de pagamento
            realizado.
          </CardText>
          <CardText>
            Ao efetuar o pagamento, declaro que concordo com os termos acima.
          </CardText>
        </div>
      </CardBody>
    </Card>
  );
};

export default PaymentWarningMessage;
