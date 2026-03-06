import { useContext }                 from "react";
import CustomModal                    from "../CustomModal";
import SubmitRequestBtn               from "./SubmitRequestBtn";
import paymentContext                 from "../../paymentContext";
import PaymentConfirmationContent     from "./PaymentReviewContent";
import { setShowPaymentReviewModal }  from "../../actions/setShowModal";

function PaymentReviewModal() {
  const { state, dispatch } = useContext(paymentContext);
  return (
    <CustomModal
      color="warning"
      borderColor="warning"
      show={state.showPaymentReviewModal}
      setShow={(bool) => dispatch(setShowPaymentReviewModal(bool))}
      title="Revisar cobrança"
      body={<PaymentConfirmationContent />}
      footer={<SubmitRequestBtn />}
    />
  );
}

export default PaymentReviewModal;
