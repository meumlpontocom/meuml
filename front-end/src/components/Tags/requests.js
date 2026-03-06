/* eslint-disable import/no-anonymous-default-export */
import api from "../../services/api";
import Swal from "sweetalert2";
import {
  toggleLoading,
  saveTagList,
  deleteSavedTags,
  saveModalInputValue,
  saveSelectedAdsTagList,
  saveTagPagination,
} from "../../redux/actions/_tagsActions";
import { getToken } from "../../services/auth";
import { toast } from "react-toastify";

export default /* tags */ {
  async getTags({ dispatch, page = 1 }) {
    try {
      dispatch(toggleLoading(true));
      const url = `/tags?sort_order=asc&page=${page}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      dispatch(saveTagList(response.data.data));
      dispatch(saveTagPagination(response.data.meta));
    } catch (error) {
      Swal.fire({
        title: "Atenção",
        html: error.response ? error.response.data.message : error.message ? error.message : error,
        showCloseButton: true,
      });
    } finally {
      dispatch(toggleLoading(false));
    }
  },

  async getTagsFromAdvertise({ dispatch, advertiseId }) {
    try {
      dispatch(toggleLoading());
      if (advertiseId.list.length) {
        advertiseId.list.forEach(async id => {
          await api
            .get(`/tags/advertisings/${id}`)
            .then(response => dispatch(saveSelectedAdsTagList(response.data.data)))
            .catch(error =>
              toast(error.response?.data?.message || error.message, {
                type: "error",
                closeOnClick: false,
                autoClose: 5000,
                position: "top-right",
              }),
            )
            .finally(() => dispatch(toggleLoading(false)));
        });
      } else {
        dispatch(toggleLoading());
        return;
      }
    } catch (error) {
      Swal.fire({
        title: "Atenção",
        html: error.response ? error.response.data.message : error.message ? error.message : error,
        showCloseButton: true,
      });
      dispatch(toggleLoading());
    }
  },

  async createTagOnAdvert({ confirmed, dispatch, tags, advertising, filters }) {
    try {
      dispatch(toggleLoading());
      const url = `/tags/advertisings?confirmed=${confirmed}&select_all=${
        advertising.selectAll ? 1 : 0
      }&${filters}`;
      const payload = {
        data: {
          type: "tag_advertisings",
          attributes: {
            tags: [...tags.current],
            advertisings_id: [...advertising.list],
          },
        },
      };
      const response = await api.post(url, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.data.status === "success") {
        dispatch(saveTagList([...tags.previous, ...tags.current.map((name, id) => ({ id, name }))]));
        dispatch(saveModalInputValue(""));
        this.getTags({ dispatch });
      }

      const { message, status } = response.data;
      const tryAgainMessage = "Não foi possível salvar esta alteração, tente novamente.";
      Swal.fire({
        title: status === "success" ? "Sucesso!" : "Atenção",
        text: status !== "success" ? tryAgainMessage : message,
        type: status,
        showCloseButton: true,
      });
    } catch (error) {
      handleErrorWithSweetAlert(error);
    } finally {
      dispatch(toggleLoading());
    }
  },

  async deleteTags({ confirmed, dispatch, tags, advertising, filters }) {
    try {
      dispatch(toggleLoading());
      const url = `/tags/advertisings?confirmed=${confirmed}&select_all=${advertising.selectAll ? 1 : 0}${
        filters && filters !== 1 ? `&${filters}` : ""
      }`;
      const payload = {
        data: {
          type: "untag_advertisings",
          attributes: {
            tags: [...tags],
            advertisings_id: [...advertising.list],
          },
        },
      };
      const response = await api.delete(
        url,
        { data: payload },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (response.data.status === "success") {
        tags.forEach(tag => dispatch(deleteSavedTags(tag)));
      }

      const { message, status } = response.data;
      const tryAgainMessage = "Não foi possível salvar esta alteração, tente novamente.";
      Swal.fire({
        title: status === "success" ? "Sucesso!" : "Atenção",
        text: status !== "success" ? tryAgainMessage : message,
        type: status,
        showCloseButton: true,
      });
    } catch (error) {
      handleErrorWithSweetAlert(error);
    } finally {
      dispatch(toggleLoading());
    }
  },
};

function handleErrorWithSweetAlert(error) {
  Swal.fire({
    title: "Atenção!",
    type: "error",
    text: error.response ? error.response.data.message : error.message ? error.message : error,
    showCloseButton: true,
  });
}
