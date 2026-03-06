import { getToken } from "../../../services/auth";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default async function fetchProcessesDetails({
  isLoadingProcessItem,
  setIsLoadingProcessItem,
  dispatch,
  saveProcessDetails,
  processId,
}) {
  try {
    setIsLoadingProcessItem({ ...isLoadingProcessItem, [processId]: true });
    const url = `/process/${processId}`;
    const {
      data: { data, message, status },
    } = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (status === "success" || message === "Processos localizados")
      dispatch(saveProcessDetails({ processId, details: data }));
    else
      Swal.fire({
        title: "Erro",
        html: `<p>${message}</p>`,
        showCloseButton: true,
        type: "error",
      });
  } catch (error) {
    Swal.fire({
      title: "Erro",
      html: `<p>${error?.response?.data?.message || error}</p>`,
      showCloseButton: true,
      type: "error",
    });
  } finally {
    setIsLoadingProcessItem({ ...isLoadingProcessItem, [processId]: false });
  }
}
