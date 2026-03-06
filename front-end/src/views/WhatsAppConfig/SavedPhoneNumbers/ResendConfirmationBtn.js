import React, { useContext } from "react";
import { DropdownItem } from "reactstrap";
import { FaSync } from "react-icons/fa";
import api from "src/services/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { context } from "../context";

function ResendConfirmationBtn({
  phoneId,
  startLoadingCard,
  stopLoadingCard,
  requestHeaders,
}) {
  const { refreshSavedPhoneNumbersData } = useContext(context);
  async function handleResendPhoneConfirmationClick() {
    startLoadingCard(phoneId);
    const resendConfirmationTokenResponse = await api
      .post(`/phones/${phoneId}/resend-code`, {}, requestHeaders)
      .catch(() => {
        toast(
          "Não foi possível reenviar o código de confirmação. Por favor, tente novamente mais tarde.",
          {
            type: toast.TYPE.ERROR,
            autoClose: 15 * 1000,
          }
        );
        stopLoadingCard();
      });

    if (resendConfirmationTokenResponse?.data?.status === "success") {
      const userInput = await Swal.fire({
        type: "success",
        input: "text",
        title: "Código de confirmação",
        text: resendConfirmationTokenResponse.data.message,
      });

      if (userInput.value) {
        const confirmPhoneResponse = await api.post(
          `/phones/${phoneId}/confirm/${userInput.value}`,
          {},
          requestHeaders
        );
        if (confirmPhoneResponse.data?.status === "success") {
          await refreshSavedPhoneNumbersData();
        } else {
          toast(confirmPhoneResponse.data?.message, {
            type: toast.TYPE.ERROR,
            autoClose: 15 * 1000,
          });
        }
      }
    }
    stopLoadingCard();
  }

  return (
    <DropdownItem
      id="code-input-btn"
      name="code-input-btn"
      onClick={() => handleResendPhoneConfirmationClick()}
    >
      <FaSync className="mr-2" />
      Reenviar confirmação
    </DropdownItem>
  );
}

export default ResendConfirmationBtn;
