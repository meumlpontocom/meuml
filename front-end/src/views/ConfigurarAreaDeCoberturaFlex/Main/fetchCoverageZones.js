import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import Swal from "sweetalert2";

export default async function fetchCoverageZones({
  accountId,
  setLoading,
  dispatch,
  saveFlexShippingCoverageZone,
}) {
  try {
    if (accountId) {
      const url = `/shipping/mercado-envios-flex/expand-coverage?account_id=${accountId}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.data.status === "success") {
        dispatch(saveFlexShippingCoverageZone(response.data.data));
      }
    }
  } catch (error) {
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
  } finally {
    setLoading(false);
  }
}
