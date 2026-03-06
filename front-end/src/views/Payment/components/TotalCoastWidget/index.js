import { useContext, useState } from "react";
import { FaDollarSign }         from "react-icons/fa";
import CustomModal              from "../CustomModal";
import CardBtnWidget            from "../CardBtnWidget";
import paymentContext           from "../../paymentContext";

function TotalCoastWidget() {
  const { state }       = useContext(paymentContext);
  const [show, setShow] = useState(false);
  return (
    <>
      <CustomModal
        color="success"
        borderColor="success"
        show={show}
        setShow={setShow}
        title="Total"
        body={
          <div style={{ fontSize: "24px"}}>
            <p>
              Operação:&nbsp;
              {state.payments.orderType?.toLowerCase() === "subscription"
                ? "Assinatura MeuML"
                : state.payments.orderType?.toLowerCase() === "credits"
                ? "Compra de créditos"
                : "Pagamento"}
            </p>
            <p>
              <strong>
                Total: <em>{state.payments?.totalFormatted}</em>
              </strong>
            </p>
          </div>
        }
      />
      <CardBtnWidget
        id="total"
        name="total"
        onClick={() => setShow(true)}
        icon={
          <h2 className="text-white">
            <FaDollarSign className="mt-3" />
          </h2>
        }
        title="Total a pagar"
        color="success"
        content={
          <>
            <h1>
              <em>{state.payments?.totalFormatted}</em>
            </h1>
            <small className="text-muted float-right">
              Clique para detalhes
            </small>
          </>
        }
      />
    </>
  );
}

export default TotalCoastWidget;
