import React, { useContext } from "react";
import { CButton }           from "@coreui/react";
import { toast }             from "react-toastify";
import { FaTrash }           from "react-icons/fa";
import { deletePhoneNumber } from "../requests";
import { context }           from "../context";

function DeletePhoneBtn({ phoneId, startLoadingCard, stopLoadingCard }) {
  const { refreshSavedPhoneNumbersData } = useContext(context);

  async function handleDeletePhoneClick() {
    startLoadingCard(phoneId, "border-danger");
    const deletePhoneResponse = await deletePhoneNumber({ phoneId });

    if (deletePhoneResponse?.data?.status === "success") {
      toast(deletePhoneResponse.data.message, {
        type: toast.TYPE.SUCCESS,
        autoClose: 10 * 1000,
      });
      await refreshSavedPhoneNumbersData();
    }
    stopLoadingCard();
  }

  return (
    <CButton
      color="danger"
      onClick={() => handleDeletePhoneClick()}
      className="ml-2"
    >
      Remover
      <FaTrash className="ml-2" />
    </CButton>
  );
}

export default DeletePhoneBtn;
