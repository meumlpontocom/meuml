import api          from "src/services/api";
import Swal         from "sweetalert2";
import { getToken } from "src/services/auth";

export async function fetchInventoryReports({ page }) {
  try {
    const url = `/stock?page=${page}`;
    const headers = { headers: { Authorization: `Bearer ${getToken()}` } }
    const response = await api.get(url, headers);
    return response.data;
  } catch (error) {
    Swal.fire({
      title: "Erro!",
      text: error.response?.data?.message || error.message,
      showCloseButton: true,
      type: "error"
    });
    if (error.response?.data) {
      return { ...error.response.data }
    }
  }
}
