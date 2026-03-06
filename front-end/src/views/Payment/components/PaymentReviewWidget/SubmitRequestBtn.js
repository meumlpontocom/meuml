import { useCallback }       from "react";
import Swal                  from "sweetalert2";
import { CButton, CSpinner } from "@coreui/react";
import { FaCheckCircle }     from "react-icons/fa";
import { useHistory }        from "react-router-dom";
import useInvoice            from "../../hooks/useInvoice";
import usePayment            from "../../hooks/usePayment";
import useModalController    from "../../hooks/useModalController";

function SubmitRequestBtn() {
  const history                                           = useHistory();
  const { createNewInvoice, isLoading: isLoadingInvoice } = useInvoice();
  const { createPayment, isLoading: isLoadingPayment }    = usePayment();
  const { setShowPaymentReviewModal, setShowPixModal }    = useModalController();

  const handleSubmitBtnClick = useCallback(async () => {
    const invoiceResponse = await createNewInvoice();
    if (invoiceResponse.error === "missing_internal_order_id") {
      await Swal.fire({
        title: "Oops!",
        text: "Parece que você ainda não especificou um produto/serviço. Vá para a tela de Créditos ou Assinaturas para continuar.",
        type: "error",
      });
      history.push("/");
      return;
    }
    if (invoiceResponse.data?.statusCode === 200) {
      const paymentResponse = await createPayment();
      if (paymentResponse.data?.statusCode === 200) {
        localStorage.removeItem("@MeuML-Checkout");
        localStorage.setItem("@MeuML-PaymentURL", paymentResponse.data.data);
        setShowPaymentReviewModal(false);
        setShowPixModal(true);
      }
    }
  }, [createNewInvoice, createPayment, history, setShowPaymentReviewModal, setShowPixModal]);

  return (
    <CButton
      color="warning"
      variant="outline"
      size="lg"
      disabled={isLoadingInvoice || isLoadingPayment}
      onClick={() => handleSubmitBtnClick()}
    >
      {isLoadingInvoice ? (
        <CSpinner size="sm" color="warning" className="mb-1" />
      ) : (
        <FaCheckCircle className="mb-1" />
      )}
      &nbsp;Gerar cobrança
    </CButton>
  );
}

export default SubmitRequestBtn;
