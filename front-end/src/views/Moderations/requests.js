import api from "../../services/api";
import { getToken } from "../../services/auth";
import Swal from "sweetalert2";
import {
  saveModerationsData,
  saveModerationsMeta,
  toggleModerationsLoading,
} from "../../redux/actions/_moderationActions";

const createHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export async function fetchModerations({
  id,
  page = 1,
  dispatch,
  dateFrom,
  dateTo,
}) {
  try {
    dispatch(toggleModerationsLoading());
    if (id) {
      let response = { moderations: [] };
      const accountId = `account_id=${id}`;
      const _page = `page=${page}`;
      const _dateFrom = `date_from=${dateFrom}`;
      const _dateTo = `date_to=${dateTo}`;
      const url = `/moderations?${accountId}&${_page}&${_dateFrom}&${_dateTo}&sort_name=date_created&sort_order=desc`;
      const {
        data: { data, message, meta, status },
      } = await api.get(url, createHeaders());
      response = {
        ...response,
        moderations: [...response.moderations, ...data],
        message,
        status,
        meta,
      };

      if (response.moderations?.length) {
        dispatch(saveModerationsData(response.moderations));
        dispatch(saveModerationsMeta(response.meta));
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      type: "error",
      text: error.response
        ? error.response.data?.message
        : error.message
        ? error.message
        : error,
      showCloseButton: true,
    });
  } finally {
    dispatch(toggleModerationsLoading());
  }
}

export async function fetchTotalModerationAmount() {
  try {
    const url = `/moderations/total-advertisings-by-account`;
    const response = await api.get(url, createHeaders());
    return response.data.status === "success" ? response.data.data : null;
  } catch (error) {
    Swal.fire("Erro!", error.response?.data?.message || error.message, "error");
    return null;
  }
}
