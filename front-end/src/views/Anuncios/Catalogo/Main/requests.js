import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";
import Swal from "sweetalert2";
import {
  saveAdvertising,
  saveAdvertsMeta,
  toggleLoading,
  clearAdvertsState,
} from "../../../../redux/actions/_catalogActions";

export async function getAdverts({ filters, page, dispatch }) {
  try {
    dispatch(toggleLoading());
    dispatch(clearAdvertsState());
    const url = filters ? `/catalog?${filters}&page=${page}` : `/catalog?page=${page}`;

    const {
      data: { data, meta },
    } = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (data.length) {
      dispatch(saveAdvertising(data));
      dispatch(saveAdvertsMeta(meta));
    }
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      type: "error",
      text: error.response ? error.response.data.message : error.message ? error.message : error,
      showCloseButton: true,
    });
  } finally {
    dispatch(toggleLoading());
  }
}

export async function publishMultipleAdverts({ subscriptionValidation, dispatch }) {
  try {
    dispatch(toggleLoading());

    const url = `/catalog/?advertising_ids=${subscriptionValidation.allowed.map(
      advert => advert.external_id,
    )}`;

    const {
      data: { status, message },
    } = await api.post(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    Swal.fire({
      title: "Atenção",
      type: status,
      text: message,
      showCloseButton: true,
    });
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      type: "error",
      text: error.response ? error.response.data.message : error.message ? error.message : error,
      showCloseButton: true,
    });
  } finally {
    dispatch(toggleLoading());
  }
}
