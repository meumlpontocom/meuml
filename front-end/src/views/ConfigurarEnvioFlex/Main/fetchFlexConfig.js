import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import Swal from "sweetalert2";

export function handleError(error) {
  if (error.response) {
    if (error.response.data.status === "error") {
      window.location.assign("/#/contas");
    }
    Swal.fire({
      title: "Erro!",
      html: `<p>${error.response.data.message}</p>`,
      type: "error",
      showCloseButton: true,
    });
    return error.response;
  }
  Swal.fire({
    title: "Erro!",
    html: `<p>${error.message ? error.message : error}</p>`,
    type: "error",
    showCloseButton: true,
  });
  return error;
}

export default async function fetchFlexConfig({
  accountId,
  setLoading,
  setCurrentFlexConfig,
}) {
  try {
    if (accountId) {
      const url = `/shipping/mercado-envios-flex/check-configuration?account_id=${accountId}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.data.status === "success") {
        setCurrentFlexConfig(response.data.data.configuration);
      }
    }
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
}
