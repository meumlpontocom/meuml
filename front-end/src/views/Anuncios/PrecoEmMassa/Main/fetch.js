import React from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { ToastDone } from "../ToastDone";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";

export async function fetchApi(
  { moreOrLess, price_rate: price, price_real, price_percent },
  setLoading,
  selectedAds,
  advertsUrl,
  history,
  confirmed = false
) {
  setLoading(true);
  try {
    const priceReal = moreOrLess === "Baixar" ? -price_real : price_real;
    const pricePercent =
      moreOrLess === "Baixar" ? -price_percent : price_percent;

    const formData = new FormData();
    const price_rate = Number(price, 10);
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
    formData.append("price_rate", price_rate);
    formData.append(
      "price_premium",
      price_rate === 1 ? Number(pricePercent, 10) : Number(priceReal, 10)
    );
    formData.append(
      "price_classic",
      price_rate === 1 ? Number(pricePercent, 10) : Number(priceReal, 10)
    );
    formData.append(
      "price_free",
      price_rate === 1 ? Number(pricePercent, 10) : Number(priceReal, 10)
    );
    formData.append("advertisings_id", list);
    const response = await api.post(
      `/advertisings/mass-alter-price?confirmed=${
        confirmed ? 1 : 0
      }&select_all=${selectedAds.allChecked ? 1 : 0}${
        selectedAds.allChecked ? `&${advertsUrl}` : ""
      }`,
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
          fetchApi(
            { moreOrLess, price_rate: price, price_real, price_percent },
            setLoading,
            selectedAds,
            advertsUrl,
            history,
            true
          );
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
    toast.error(error.response.data.message, {
      type: toast.TYPE.ERROR,
      autoClose: 12000,
      position: "top-center",
    });
  } finally {
    setLoading(false);
  }
}
