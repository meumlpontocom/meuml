import Swal                     from "sweetalert2";
import api, { headers }         from "src/services/api";
import { fetchPredictCategory } from "../Create/requests";

const handleRequestError = async error => {
  return await Swal.fire({
    title: "Erro!",
    text: error?.response?.data?.message || error?.message || error,
    type: "error",
    showCloseButton: true,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "Ok",
  });
};

export { fetchPredictCategory };

export async function navigateCategoryTree(categoryId) {
  try {
    const url = `/categories-tree?category_id=${categoryId}&include_attributes=1`;
    const response = await api.post(url, {}, headers());
    return response?.data || {};
  } catch (error) {
    return await handleRequestError(error);
  }
}

export async function fetchRequiredCategoryAttributes({ selectedCategory }) {
  try {
    const url = `/charts?domain=${selectedCategory}`;
    const response = await api.get(url, headers());
    const { data } = response.data;
    return data;
  } catch (error) {
    return await handleRequestError(error);
  }
}

export async function fetchCatalogCharts({ payload }) {
  try {
    const response = await api.post("/charts", payload, headers());
    return response.data.data;
  } catch (error) {
    return error.response.data.details.SPECIFIC.error || await handleRequestError(error);
  }
}


export async function createNewCatalogChart(payload) {
  try {
    const url = "/charts/new";
    const response = await api.post(url, payload, headers());
    return response.data;
  } catch (error) {
    return await handleRequestError(error);
  }
}

export async function editCatalogChart(payload, chartId) {
  try {
    const url = `/charts/${chartId}`;
    const response = await api.put(url, payload, headers());
    return response.data;
  } catch (error) {
    return await handleRequestError(error);
  }
}

export async function editCatalogChartRow(payload, chartId, rowId) {
  try {
    const url = `/charts/${chartId}/rows/${rowId}`;
    const response = await api.put(url, payload, headers());
    return response.data;
  } catch (error) {
    return await handleRequestError(error);
  }
}

export async function addCatalogChartRow(payload, chartId) {
  try {
    const url = `/charts/${chartId}/rows/new`;
    const response = await api.post(url, payload, headers());
    return response.data;
  } catch (error) {
    return error.response?.data || error.response || error;
  }
}

export async function linkChartRowWithAdverts(selectAll, confirmed, payload) {
  try {
    const url = `/charts/link-advertisings?select_all=${selectAll}&confirmed=${confirmed}`;
    const response = await api.post(url, payload, headers());
    await Swal.fire({
      title: "Atenção!",
      text: response.data.message,
      type: "success",

    });
    return response.data;
  } catch (error) {
    await Swal.fire({
      tile: "Erro!",
      type: "error",
      message: error.response?.data?.message || error.message || error
    });
    return error.response?.data || error.response || error;
  }
}