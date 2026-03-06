import Swal from "sweetalert2";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";

function handleError({ error }) {
  if (error.response) {
    Swal.fire({
      title: "Atencao!",
      html: `<p>${error.response.data.message}</p>`,
      showCloseButton: true,
      type: error.response.data.status,
    });
    return {
      error: error.response,
      path: [],
      children: [],
      isLeaf: 0,
      attributes: [],
    };
  }
  Swal.fire({
    title: "Erro!",
    html: `<p>${error}</p>`,
    showCloseButton: true,
    type: "error",
  });
  return {
    error,
    path: [],
    children: [],
    isLeaf: 0,
    attributes: [],
  };
}

export async function fetchUpdateFlexStatus({
  flexStatus,
  advertsIds,
  allChecked,
  setLoading,
  confirmed = false,
  history,
  filters,
}) {
  try {
    const formData = new FormData();
    formData.append("activate", flexStatus);
    if (!allChecked) formData.append("advertisings_id", advertsIds);
    let url = `/shipping/mercado-envios-flex/change?${filters}&select_all=${allChecked ? 1 : 0}&confirmed=${
      confirmed ? 1 : 0
    }`;
    const response = await api.put(url, formData, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    !confirmed
      ? Swal.fire({
          title: "Atenção",
          html: `<p>${response.data.message}</p>`,
          type: response.data.status,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
        }).then(user => {
          if (user.value && !confirmed) {
            fetchUpdateFlexStatus({
              flexStatus,
              advertsIds,
              allChecked,
              setLoading,
              confirmed: true,
              history,
              filters,
            });
          } else history.push("/anuncios");
        })
      : Swal.fire({
          title: "Atenção",
          html: `<p>${response.data.message}</p>`,
          type: response.data.status,
          showCloseButton: true,
        }).then(user => history.push("/anuncios"));
  } catch (error) {
    handleError({ error });
  } finally {
    setLoading(false);
  }
}
