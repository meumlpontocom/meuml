import Swal from "sweetalert2";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";

function handleError({ error }) {
  if (error.response) {
    switch (error.response.data.message) {
      case "Esta conta ainda não possui permissão para utilizar o Mercado Envios Flex.":
        break;
      default:
        Swal.fire({
          title: "Erro!",
          html: `<p>${error.response.data.message}</p>`,
          type: "error",
          showCloseButton: true,
        });
        break;
    }
  } else
    Swal.fire({
      title: "Erro!",
      html: `<p>${error.message ? error.message : error}</p>`,
      type: "error",
      showCloseButton: true,
    });
}

export async function fetchFlexSendingConfig({ id }) {
  try {
    const url = `/shipping/mercado-envios-flex/check-configuration?account_id=${id}`;
    const { data: message, status, data } = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return true; // Flex is not allowed
  } catch (error) {
    // handleError({ error });
    return true;
  }
}
