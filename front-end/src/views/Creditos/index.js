import React, { useEffect, useMemo, useState } from "react";
import { AccountBalance, OrderForm, SubmitBtn, TermsAndConditionsOfUse } from "./components";
import { CContainer, CRow } from "@coreui/react";
import { Provider } from "./creditsContext";
import PageHeader from "src/components/PageHeader";
import CancelOrder from "./components/CancelOrder";
import Swal from "sweetalert2";

export default function CreditosMainComponent() {
  const [paymentMode, setPaymentMode] = useState("0");
  const [orderValue, setOrderValue] = useState(20.0);
  const [showForm, setShowForm] = useState(false);
  const showTicketWarning = useMemo(() => paymentMode === "0" && orderValue < 20, [orderValue, paymentMode]);

  const isMobile = useMemo(() => {
    const details = navigator.userAgent;
    const regexp = /android|iphone|kindle|ipad/i;
    const isMobileDevice = regexp.test(details);
    return isMobileDevice;
  }, []);

  useEffect(() => {
    Swal.fire({
      title: "Cópia de anuncios de concorrentes desativada",
      type: "error",
      html: `<div>
        Devido a mudanças recentes nos sistemas de integração, não é mais possível replicar anúncios de concorrentes em nenhuma das plataformas
      </div>`,
      showConfirmButton: true,
      confirmButtonText: "Entendido",
    });
  }, []);

  return (
    <Provider
      value={{
        showForm,
        setShowForm,
        isMobile,
        orderValue,
        showTicketWarning,
        paymentMode,
        setOrderValue,
        setPaymentMode,
      }}
    >
      <CContainer>
        <PageHeader heading="Créditos" />
        <CRow>
          <TermsAndConditionsOfUse />
          <AccountBalance />
          <OrderForm />
          <CancelOrder />
          <SubmitBtn />
        </CRow>
      </CContainer>
    </Provider>
  );
}
