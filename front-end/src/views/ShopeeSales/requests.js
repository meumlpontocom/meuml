import React from "react";
import {
  toggleLoading,
  saveSales,
  saveMeta,
} from "../../../redux/actions/_salesActions";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import Swal from "sweetalert2";

export async function fetchSales({
  dispatch,
  selectedAccounts,
  filterString,
  filterStatus = [],
  page = 1,
}) {
  try {
    dispatch(toggleLoading());
    const filter_status = filterStatus.length
      ? `&filter_status=${filterStatus}`
      : "";
    const filter_string = filterString
      ? `&search=${String(filterString).trim()}`
      : "";
    const selected_accounts = selectedAccounts.length
      ? `&filter_account=${selectedAccounts?.map((account) => account.id)}`
      : "";

    const url = `/shopee/orders?page=${page}${selected_accounts}${filter_string}${filter_status}`;
    const {
      data: { data, meta, status },
    } = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (status === "success") {
      dispatch(saveSales(data));
      dispatch(saveMeta(meta));
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
