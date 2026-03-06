import Swal         from "sweetalert2";

import api          from "src/services/api";
import { getToken } from "src/services/auth";

import {
  saveProduct,
  saveProductMeta,
  toggleLoading,
  clearProductsState,
  toggleLoadingStatus,
  toggleLoadingShipping
} from "src/redux/actions/_mshopsActions";

const headers = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });


export async function getAProductsMshops({ filters, page = 1, dispatch }) {
  try {
    dispatch(toggleLoading());
    dispatch(clearProductsState());
    const url = filters
      ? `/mshops/advertisings?${filters}&page=${page}`
      : `/mshops/advertisings?page=${page}`;

    const {
      data: { data, meta },
    } = await api.get(url, headers());

    if (data.length) {
      dispatch(saveProduct(data));
      dispatch(saveProductMeta(meta));
    }
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      type: "error",
      text: error.response
        ? error.response.data.message
        : error.message
        ? error.message
        : error,
      showCloseButton: true,
    });
  } finally {
    dispatch(toggleLoading());
  }
}

export async function fetchProductStatusMshops({ formData, confirmed, dispatch }) {
  try {
    dispatch(toggleLoadingStatus());
    const url = `/mshops/advertisings/mass-alter-status?confirmed=${confirmed}`;
    const response = await api.post(url, formData, headers());
    return response.data;

  } catch (error) {
    return error?.response || error.message;
  } finally {
    dispatch(toggleLoadingStatus());
  }
}

export async function fetchProductShippingMshops({ data, advertising_id, dispatch }) {
  try {
    dispatch(toggleLoadingShipping());
    const url = `/mshops/update-advertising-shipping/${advertising_id}`;
    const response = await api.put(url, data, headers());
    return response.data;

  } catch (error) {
    return error?.response || error.message;
  } finally {
    dispatch(toggleLoadingShipping());
  }
}