import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";
import Swal from "sweetalert2";

export async function updateHighQualityProperties({ toggleLoading, advertisingId }) {
  try {
    toggleLoading();
    const url = `/catalog/edit-high-quality?advertising_id=${advertisingId}`;
    const {
      data: { data, message, status },
    } = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (status === "success") return { ...data };
    else
      Swal.fire({
        title: "Atenção",
        text: message,
        type: status,
        showCloseButton: true,
      });
  } catch (error) {
    return error;
  } finally {
    toggleLoading();
  }
}
