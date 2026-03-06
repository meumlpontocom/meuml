import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import Swal from "sweetalert2";

export default async function putExpandCoverageZones({ accountId, setLoading, selectedZones }) {
  try {
    const url = `/shipping/mercado-envios-flex/expand-coverage`;
    const response = await api.put(
      url,
      {},
      {
        headers: { Authorization: `Bearer ${getToken()}` },
        params: { account_id: accountId, zones: selectedZones.join(",") },
      },
    );
    if (response.data.status === "success") {
      Swal.fire({
        title: "Atenção!",
        html: `<p>${response.data.message}</p>`,
        type: "success",
        showCloseButton: true,
      }).then(() => window.location.assign("/#/contas"));
    }
  } catch (error) {
    if (error.response) {
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
