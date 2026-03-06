import React from "react";
import {
  toggleLoading,
  saveSales,
  saveMeta,
} from "../../../redux/actions/_salesActions";
import Swal from "sweetalert2";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import withReactContent from "sweetalert2-react-content";

export async function fetchSales({
  shouldFetchMShopsData,
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
    const selected_accounts = selectedAccounts?.length
      ? `&filter_account=${selectedAccounts?.map((account) => account.id)}`
      : "";
    const mshops = `&mshops=${shouldFetchMShopsData}`;
    
    const url = `/orders?page=${page}${selected_accounts}${filter_string}${filter_status}${mshops}`;
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const {
      data: { data, meta, status },
    } = response;

    if (status === "success") {
      dispatch(saveSales(data));
      dispatch(saveMeta(meta));
    }

    return response;
  } catch (error) {
    await Swal.fire({
      title: "Atenção",
      type: "error",
      text: error.response
        ? error.response.data.message
        : error.message
        ? error.message
        : error,
      showCloseButton: true,
    });

    return error?.response;
  } finally {
    dispatch(toggleLoading());
  }
}

export async function postTagsToDownload({ selectedSales, setIsLoading, confirmed = 0 }) {
  try {
    const ReactSwal = withReactContent(Swal);

    if (selectedSales.length) {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      const url = `/orders/shipment/print-label?select_all=${0}&confirmed=${
        confirmed ? 1 : 0
      }`;
      const payload = {
        file_type: "pdf",
        orders_id: selectedSales,
      };
      const response = await api.post(url, payload, config);
      const user = await ReactSwal.fire({
        title: "Processar Etiquetas",
        html: <>{response.data.message}</>,
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: !confirmed ? "Processar" : "Ver processos",
        cancelButtonText: !confirmed ? "Cancelar" : "Fechar",
        type: !confirmed ? "info" : response.data.status,
      });
      if (!user.dismiss && user.value && confirmed === 0) {
        postTagsToDownload({ selectedSales, setIsLoading, confirmed: 1 });
      } else if (!user.dismiss && user.value && confirmed === 1) {
        window.location.assign("#/processos");
      }
    } else {
      ReactSwal.fire({
        title: "Atenção!",
        text: "Por favor, certifique-se de selecionar ao menos uma venda.",
        type: "warning",
        showCloseButton: true,
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}
