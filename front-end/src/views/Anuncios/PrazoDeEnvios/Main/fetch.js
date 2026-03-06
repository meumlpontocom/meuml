import Swal from "sweetalert2";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";

export async function fetchApi({ days }, setLoading, ads, advertsUrl, history, confirmed = false) {
  try {
    setLoading(true);
    const formData = new FormData();
    let list = ads.allChecked ? "" : ads;
    if (ads.allChecked) list = [];
    formData.append("days", days);
    formData.append("advertisings_id", list);
    const response = await api.post(
      `/advertisings/mass-alter-manufacturing-time?confirmed=${confirmed ? 1 : 0}&select_all=${
        ads.allChecked ? 1 : 0
      }${ads.allChecked ? `&${advertsUrl}` : ""}`,
      formData,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );
    if (!confirmed) {
      Swal.fire({
        title: "Atenção",
        html: `<p>${response.data.message || response.message}</p>`,
        type: response.data.status || response.status,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        showConfirmButton: true,
        confirmButtonText: "Confirmar",
      }).then(user => {
        if (user.value) {
          fetchApi({ days }, setLoading, ads, advertsUrl, history, true);
        } else history.push("/anuncios");
      });
    } else {
      Swal.fire({
        title: "Atenção",
        html: `<p>${response.data.message}</p>`,
        type: response.data.status,
        showCloseButton: true,
      }).then(() => {
        history.push("/anuncios");
      });
    }
  } catch (error) {
    if (error.response) {
      return Swal.fire({
        title: "Atenção",
        html: `<p>${error.response.data.message}</p>`,
        type: "error",
        showCloseButton: true,
      });
    }
    return Swal.fire({
      title: "Atenção",
      html: `<p>${error}</p>`,
      type: "error",
      showCloseButton: true,
    });
  } finally {
    setLoading(false);
    history.push("/anuncios");
  }
}
