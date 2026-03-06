import React, { useContext } from "react";
import Swal from "sweetalert2";
import { DropdownItem } from "reactstrap";
import { FaQrcode } from "react-icons/fa";
import { confirmPhoneNumber } from "../requests";
import { context } from "../context";

function InformConfirmationBtn({ phoneId }) {
  const { refreshSavedPhoneNumbersData } = useContext(context);
  async function handleClick() {
    const { value } = await Swal.fire({
      title: "",
      type: "question",
      input: "text",
      text: "Digite o código enviado no seu WhatsApp",
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
    });

    if (value) {
      const sendConfirmationResponse = await confirmPhoneNumber({
        confirmationCode: value,
        phoneId,
      });
      if (sendConfirmationResponse?.data?.status === "success") {
        await refreshSavedPhoneNumbersData();
      }
    }
  }

  return (
    <DropdownItem
      id="code-input-btn"
      name="code-input-btn"
      onClick={handleClick}
    >
      <FaQrcode className="mr-2" />
      Digitar código
    </DropdownItem>
  );
}

export default InformConfirmationBtn;
