import { FaStickyNote }    from "react-icons/fa";
import CardBtnWidget       from "../CardBtnWidget";
import PaymentRequestModal from "./PaymentReviewModal";
import useModalController  from "../../hooks/useModalController";

function PaymentRequestWidget() {
  const { setShowPaymentReviewModal } = useModalController();
  return (
    <CardBtnWidget
      onClick={() => setShowPaymentReviewModal(true)}
      icon={
        <h2 className="text-white">
          <FaStickyNote className="mt-3" />
        </h2>
      }
      color="warning"
      id="paymentRequest"
      name="paymentRequest"
      title="Gerar cobrança"
      content={
        <>
          <PaymentRequestModal />
          <h1>
            <em>Pagar</em>
          </h1>
          <small className="text-muted float-right">Clique para enviar</small>
        </>
      }
    />
  );
}

export default PaymentRequestWidget;
