import React from "react";
import Swal from "sweetalert2";
import api from "../../../../services/api";
import { toast } from "react-toastify";
import { getToken } from "../../../../services/auth";
import { ToastDone } from "../../PrecoEmMassa/ToastDone";

const convertTimeString = (timeString) => {
  const dateConfig = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Date(timeString).toLocaleDateString("pt-BR", dateConfig);
};

export async function fetchApi(
  data,
  setLoading,
  selectedAds,
  advertsUrl,
  history,
  confirmed = false
) {
  try {
    if (setLoading) {
      setLoading(true);
    }
    const formData = new FormData();
    let list = Object.values(selectedAds.advertsArray)
      .filter((item) => item.checked)
      .map((item) => item.id);
    if (selectedAds.allChecked) {
      list = Object.values(selectedAds.advertsArray)
        .filter((item) => !item.checked)
        .map((item) => item.id);
    }
    if (selectedAds.pagesAllChecked) {
      list = Object.values(selectedAds.advertsArray)
        .filter((item) => item.checked)
        .map((item) => item.id);
    }
    formData.append(
      "buyers_discount_percentage",
      data.buyers_discount_percentage
    );
    formData.append(
      "best_buyers_discount_percentage",
      data.best_buyers_discount_percentage
    );
    formData.append("start_date", convertTimeString(data.start_date));
    formData.append("finish_date", convertTimeString(data.finish_date));
    formData.append("advertisings_id", list);
    const response = await api.post(
      `/advertisings/discounts?confirmed=${confirmed ? 1 : 0}&select_all=${
        selectedAds.allChecked ? 1 : 0
      }${selectedAds.allChecked ? `&${advertsUrl}` : ""}`,
      formData,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    if (!confirmed) {
      Swal.fire({
        title: "Atenção",
        html: `<p>${response.data.message || response.message}</p>`,
        type: response.data.status || response.status,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        showConfirmButton: true,
        confirmButtonText: "Confirmar",
      }).then((user) => {
        if (user.value) {
          fetchApi(data, setLoading, selectedAds, advertsUrl, history, true);
        } else history.push("/anuncios");
      });
    } else {
      toast(<ToastDone resp={response.data.message} />, {
        type: toast.TYPE.DEFAULT,
        autoClose: 12000,
        position: "top-center",
      });
    }
  } catch (error) {
    toast(
      error.response
        ? error.response.data.message
        : error.message
        ? error.message
        : error,
      {
        type: toast.TYPE.ERROR,
        autoClose: 12000,
        position: "top-center",
      }
    );
  } finally {
    setLoading && setLoading(false);
  }
}
