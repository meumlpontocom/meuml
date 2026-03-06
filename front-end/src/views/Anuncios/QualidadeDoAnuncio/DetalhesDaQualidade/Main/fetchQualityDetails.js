import Swal from "sweetalert2";
import { toggleLoading, saveQualityDetails } from "../../../../../redux/actions/_qualityDetailsActions";
import api from "../../../../../services/api";
import { getToken } from "../../../../../services/auth";

export default async function fetchQualityDetails({ dispatch, advertId, history }) {
  try {
    dispatch(toggleLoading());
    const url = `/advertisings/quality_details?advertising_id=${advertId}`;
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (response.data.status === "success") dispatch(saveQualityDetails(response.data.data));
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      type: "error",
      html: `
      <p>${error.response ? error.response.data.message : error.message ? error.message : error}</p>
      `,
      showCloseButton: true,
    });
    history.goBack();
  } finally {
    dispatch(toggleLoading());
  }
}
