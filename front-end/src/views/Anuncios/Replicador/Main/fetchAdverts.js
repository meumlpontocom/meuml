import api from "../../../../services/api";
import { getToken } from "src/services/auth";
import Swal from "sweetalert2";

export default async function fetchAdverts({
  toggleIsLoading,
  page,
  dispatch,
  url,
  nickname,
  keyword,
  category,
}) {
  try {
    toggleIsLoading();
    let _URL = `/advertisings/duplicate?page=${page}`;
    if (nickname) _URL += `&nickname=${nickname}`;
    if (category) _URL += `&category=${category}`;
    if (keyword) _URL += `&keyword=${keyword}`;

    if (nickname || category || keyword) {
      dispatch({
        type: "REPLICATION_SAVE_URL",
        payload: _URL,
      });
    }

    const {
      data: { data, meta, status, message },
    } = await api.get(keyword || nickname || category ? _URL : url, {
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
