import Swal from "sweetalert2";
import api from "../../../../../../services/api";
import { getToken } from "../../../../../../services/auth";

export default async function fetchQualityDetails({ id, setQualityDetails }) {
  try {
    const url = `/advertisings/quality_details?advertising_id=${id}`;
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (response.data.status === "success") setQualityDetails(response.data.data);
    else setQualityDetails(null);
  } catch (error) {
    if (!error.response) {
      Swal.fire({
        title: "Atenção",
        type: "error",
        html: `
      <p>${error.message ? error.message : error}</p>
      `,
        showCloseButton: true,
      });
    }
    setQualityDetails({
      actions: [
        {
          description: "Não foi possível recuperar detalhes sobre o anúncio",
          id: "error",
          name: "error",
        },
      ],
    });
  }
}
