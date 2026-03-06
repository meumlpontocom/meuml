import { getToken } from "../../../services/auth";
import api from "../../../services/api";
import Swal from "sweetalert2";

export default async function fetchProcesses({ setIsLoading, dispatch, clearProcessList, saveProcessList }) {
  try {
    setIsLoading(true);
    dispatch(clearProcessList());
    const url = "/process";
    const {
      data: { data, message, status },
    } = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (status === "success" || message === "Processos localizados") dispatch(saveProcessList(data));
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
    setIsLoading(false);
  }
}
