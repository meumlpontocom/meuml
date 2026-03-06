import React, {useState, useEffect} from "react";
import Swal from "sweetalert2";
import {useSelector} from "react-redux";
import {ContainerBoleto} from "./styles";
import {Row, Col} from "reactstrap";
import formatMoney from "../../../helpers/formatMoney";
import LoadPageHandler from "../../../components/Loading";
import Form from "./Form";
import SelectDocumentType from "../Cartao/Form/SelectDocumentType";
import MessageAboutData from "../MessageAboutData";

export default function Boleto({history}) {
  const [loading, setLoading] = useState(false);
  const [formStage, setFormStage] = useState(0);
  const [documentType, setDocumentType] = useState("");

  const selectDocumentType = (type) => {
    setDocumentType(type);
    setFormStage(1);
  };

  const payments = useSelector((state) => ({
    ...state.payments,
    totalFormatted: formatMoney(state.payments.total),
  }));

  useEffect(() => {
    if (payments?.total < 20) {
      Swal.fire({
        title: "Atenção",
        type: "warning",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "<span>Ver planos</span>",
        cancelButtonText: "<span>Cancelar</span>",
        html:
          "<p>Você precisa realizar um pedido de no mínimo R$20 para fazer pagamento via boleto.</p>",
      }).then((opt) => opt.value && history.push("/assinaturas/planos"));
    }
  }, [payments]);

  useEffect(() => {
    if (!payments.total > 0) history.push("/assinaturas/planos");
  }, [history, payments.total]);

  return (
    <ContainerBoleto>
      <Row>
        <Col xs={7}>
          <span>
            Forma de pagamento: <b>Boleto bancário</b>
          </span>
        </Col>
        <Col xs={5} className="price-total">
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
      <LoadPageHandler
        marginTop="40px"
        isLoading={loading}
        render={
          <>
            {!formStage ? (
              <SelectDocumentType selectDocumentType={selectDocumentType}/>
            ) : formStage === 1 ? (
              <Form
                history={history}
                payments={payments}
                documentType={documentType}
                setLoading={setLoading}
                setFormStage={setFormStage}
              />
            ) : (
              <></>
            )}
          </>
        }
      />
    </ContainerBoleto>
  );
}
