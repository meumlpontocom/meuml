import React, {useState, useEffect} from "react";
import Script from "react-load-script";
import {ContainerCartao} from "./styles";
import {Row, Col} from "reactstrap";
import {useSelector} from "react-redux";
import formatMoney from "../../../helpers/formatMoney";
import Form from "./Form";
import MessageAboutData from "../MessageAboutData";

export default function Cartao({history}) {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [formStage, setFormStage] = React.useState(0);
  const payments = useSelector((state) => ({
    ...state.payments,
    totalFormatted: formatMoney(state.payments.total),
  }));

  async function scriptLoaded() {
    await window.superlogica.require("pjbank");
    await window.superlogica.pjbank(
      "checkout_transparente",
      process.env.REACT_APP_PJBANK_CREDENTIAL,
    );
    setPaymentLoading(false);
  }

  useEffect(() => {
    if (payments.total <= 0) history.push("/assinaturas/planos");
  }, [history, payments.total]);

  return (
    <ContainerCartao>
      <Script
        onLoad={scriptLoaded}
        url="https://s3-sa-east-1.amazonaws.com/widgets.superlogica.net/embed.js"
      />
      <Row className="mb-2">
        <Col xs={7}>
          <span className="badge badge-light" style={{fontSize: "16px"}}>
            Forma de pagamento:{" "}
            <span
              className="badge badge-warning"
              style={{color: "white", fontSize: "16px"}}
            >
              Cartão de <i>Crédito</i>
            </span>
          </span>
        </Col>
        <Col xs={5} className="text-right">
          <span className="badge badge-light" style={{fontSize: "14px"}}>
            Valor total:{" "}
            <span
              id="valor-total-compra"
              name="valor-total-compra"
              className="badge badge-danger"
              style={{color: "white"}}
              value={payments.total}
            >
              {payments.totalFormatted}
            </span>
          </span>
        </Col>
        {formStage === 1 ? <MessageAboutData/> : <></>}
      </Row>
      <Form
        setLoading={setPaymentLoading}
        loading={paymentLoading}
        history={history}
        formStage={formStage}
        setFormStage={setFormStage}
      />
    </ContainerCartao>
  );
}
