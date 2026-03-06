import Swal from "sweetalert2";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";

export default async function handleBuy(formData) {
  try {
    const {
      data: {
        data: { id },
        message,
      },
    } = await api.post("/subscribe", formData, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    Swal.fire({
      title: "Atenção",
      showCloseButton: true,
      html: `<p>${message}</p>`,
      type: "info",
    });
    return id;
  } catch (error) {
    if (error.response) {
      Swal.fire({
        title: "Ops!",
        html: `<p>${error.response.data.message}</p>`,
        type: "warning",
        showCloseButton: true,
      });
      return error.response;
    }
    return error;
  }
}
