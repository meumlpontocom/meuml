import React, { useContext }  from "react";
import Swal                   from "sweetalert2";
import { CButton, CCol }      from "@coreui/react";
import { FaArrowCircleRight } from "react-icons/fa";
import HandleRedirect         from "./HandleRedirect";
import creditsContext         from "../creditsContext";
import useBuyCredits          from "../hooks/useBuyCredits";

const SubmitBtn = () => {
  const [redirectToPayment, requestBuyCredits, isLoading] = useBuyCredits();
  const { showForm, disabled, orderValue, isMobile } = useContext(creditsContext);

  async function handleSubmitFormClick() {
    const { value } = await Swal.fire({
      title: "Termos de uso",
      type: "warning",
      text: 'Ao clicar em "Prosseguir", você declara que concorda com os termos e condições de uso da ferramenta, explicados na página Comprar Créditos.',
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Prosseguir",
    });
    if (value) {
      localStorage.removeItem("@MeuML-Checkout");
      localStorage.removeItem("@MeuML-PaymentURL");
      requestBuyCredits(orderValue);
    }
  }
  return showForm ? (
    <CCol xs="12" sm="6" className="text-right mb-5 fade-in">
      <HandleRedirect redirectToPayment={redirectToPayment} />
      <CButton color="primary" size="lg" disabled={isLoading || disabled} onClick={handleSubmitFormClick} className={isMobile && "btn-block"}>
        Prosseguir para o pagamento <FaArrowCircleRight />
      </CButton>
    </CCol>
  ) : <></>;
};

export default SubmitBtn;
