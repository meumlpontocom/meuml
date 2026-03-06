import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";
import Swal from "sweetalert2";

export default async function fetchAdverts({ toggleIsLoading, page, dispatch, searchType, query, url }) {
  try {
    toggleIsLoading();
    const _URL = `/advertisings/duplicate?type=${searchType}&query=${query}&page=${page}`;
    if (query) {
      dispatch({
        type: "REPLICATION_SAVE_URL",
        payload: _URL,
      });
    }

    const {
      data: { data, meta, status, message },
    } = await api.get(query ? _URL : url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (status === "success") {
      dispatch({ type: "REPLICATION_SAVE_ADVERTS", payload: [...data] });
      dispatch({ type: "REPLICATION_SAVE_META", payload: { ...meta } });
    } else {
      Swal.fire({
        title: "Atenção",
        html: `<p>${message}.</>`,
        type: status,
        showCloseButton: true,
      });
      return { status: "error", meta: {}, data: [] };
    }
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      html: `<p>${error.response ? error.response.data.message : error.message ? error.message : error}.</>`,
      type: "error",
      showCloseButton: true,
    });
  } finally {
    toggleIsLoading();
  }
}
