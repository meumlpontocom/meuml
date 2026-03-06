import Swal         from "sweetalert2";
import { getToken } from "src/services/auth";
import api          from "../../../../../services/api";

export async function applyPriceToWinConditions({ advertisingId, form }) {
  try {
    const url = `/catalog/price-to-win-conditions/${advertisingId}`;
    const payload = { ...form }
    const response = await api.put(url, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    Swal.fire("Erro!", error.response?.data?.message || error.message, "error");
  }
}
