import api          from "src/services/api";
import { getToken } from "src/services/auth";
import Swal         from "sweetalert2";

export async function handleError(error) {
  if (error.response) {
    await Swal.fire({
      title: "Atenção",
      html: `<p>${error.response.data?.message}</p>`,
      type: error.response.data?.status,
      showCloseButton: true,
    });
  } else {
    await Swal.fire({
      title: "Atenção",
      html: `<p>${error.message ? error.message : error}</p>`,
      type: "error",
      showCloseButton: true,
    });
  }
  return error;
}

export async function getWhatsAppTopics() {
  try {
    return await api.get(`/phones/allowed-topics`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    await handleError(error);
  }
}

export async function getPhoneNumbers() {
  try {
    return await api.get(`/phones`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    await handleError(error);
  }
}

export async function insertNewPhoneNumber(payload) {
  try {
    return await api.post(`/phones`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    await handleError(error);
  }
}

export async function confirmPhoneNumber({ confirmationCode, phoneId }) {
  try {
    return await api.post(
      `/phones/${phoneId}/confirm/${confirmationCode}`,
      {},
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
  } catch (error) {
    await handleError(error);
  }
}

export async function deletePhoneNumber({ phoneId }) {
  try {
    return await api.delete(`/phones/${phoneId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    await handleError(error);
  }
}
