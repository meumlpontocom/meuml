import api          from "../../services/api";
import { getToken } from "src/services/auth";
import Swal         from "sweetalert2";

const createHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export async function handleRequestError(error) {
  Swal.fire({
    title: "Atenção",
    html: `<p>${error.response?.data?.message || error.message || error}</p>`,
    type: error.response.data.status ? error.response.data.status : "error",
    showCloseButton: true,
  });
  return error;
}

export async function getProductRequest({
  filterString,
  sortingOptions,
  setLoading,
  page = 1,
}) {
  const { sortName, sortOrder } = sortingOptions ?? "";
  try {
    setLoading(true);
    const filter_string = !!filterString ? `&filter_string=${filterString}` : "";
    const sort_name = sortName ? `&sort_name=${sortName}` : "";
    const sort_order = sortOrder ? `&sort_order=${sortOrder}` : "";
    return await api.get(
      `/articles?page=${page}${filter_string}${sort_name}${sort_order}`,
      createHeaders(),
    );
  } catch (error) {
    await handleRequestError(error);
    if (error.response?.data) {
      return { ...error.response.data }
    }
  } finally {
    setLoading(false);
  }
}

export async function deleteProductRequest(id, setLoading) {
  try {
    setLoading(true);
    return await api.delete(`/articles/${id}`, createHeaders());
  } catch (error) {
    handleRequestError(error);
  } finally {
    setLoading(false);
  }
}

export async function getProductDetailsRequest(articleId, setLoading) {
  try {
    setLoading(true);
    return await api.get(`/articles/${articleId}`, createHeaders());
  } catch (error) {
    handleRequestError(error);
  } finally {
    setLoading(false);
  }
}
