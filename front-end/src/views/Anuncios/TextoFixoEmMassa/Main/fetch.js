import React         from "react";
import api           from "../../../../services/api";
import { toast }     from "react-toastify";
import { ToastDone } from "../../PrecoEmMassa/ToastDone";
import { getToken }  from "../../../../services/auth";
import Swal          from "sweetalert2";

export async function fetchApi(
  { description },
  setLoading,
  selectedAds,
  advertsUrl,
  history,
  confirmed = false
) {
  setLoading(true);
  try {
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
    formData.append("description", description);

    formData.append("advertisings_id", list);
    const response = await api.post(
      `/advertisings/mass-alter-text?confirmed=${
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
            { description },
            setLoading,
            selectedAds,
            advertsUrl,
            history,
            true
          );
        } else history.push("/anuncios");
      });
    } else {
      toast(<ToastDone resp={response.data.message} history={history}/>, {
        type: toast.TYPE.DEFAULT,
        autoClose: 12000,
        position: "top-center",
      });
    }
  } catch (error) {
    toast(error.response.data.message, {
      type: toast.TYPE.ERROR,
      autoClose: 12000,
      position: "top-center",
    });
  } finally {
    setLoading(false);
  }
}
