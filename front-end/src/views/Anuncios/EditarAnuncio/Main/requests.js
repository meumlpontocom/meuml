/* eslint-disable import/no-anonymous-default-export */
import Swal from "sweetalert2";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";
import { setLoading, saveAdvertData, resetStore } from "../../../../redux/actions/_editAdvertActions";

export default {
  async getAdvert({ dispatch, advertId, history }) {
    try {
      dispatch(setLoading(true));
      const url = `/advertisings/${advertId}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.data.status === "success") dispatch(saveAdvertData(response.data.data));
    } catch (error) {
      Swal.fire({
        title: "Erro!",
        text: error.response ? error.response.data.message : error?.message || error,
        showCloseButton: true,
        type: "error",
      }).then(() => history.goBack());
    } finally {
      dispatch(setLoading(false));
    }
  },

  async putAdvert({ dispatch, advertId, form, history }) {
    try {
      dispatch(setLoading(true));
      const url = `/advertisings/${advertId}`;

      let payload = {
        data: {
          type: "advertising_update",
          attributes: {
            attributes: [],
          },
        },
      };

      Object.keys(form).forEach(advertProp => {
        if (advertProp === "gtin") {
          payload.data.attributes["attributes"] = [
            ...payload.data.attributes.attributes,
            {
              id: "GTIN",
              name: "Código universal de produto",
              value_id: form[advertProp],
              value_name: form[advertProp],
            },
          ];
        } else
          switch (typeof form[advertProp]) {
            case "number":
              if (form[advertProp] >= 0) payload.data.attributes[advertProp] = form[advertProp];
              break;

            case "string":
              if (form[advertProp]) payload.data.attributes[advertProp] = form[advertProp];
              break;

            case "boolean":
              payload.data.attributes[advertProp] = form[advertProp];
              break;

            case "object":
              if (form[advertProp]?.length || Object.keys(form[advertProp])?.length)
                payload.data.attributes[advertProp] = form[advertProp];
              break;

            default:
              break;
          }
      });

      const response = await api.put(url, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.data.status === "success") {
        Swal.fire({
          title: "Sucesso",
          text: response.data.message,
          type: "success",
          showCloseButton: true,
        }).then(() => {
          history.goBack();
          dispatch(resetStore());
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Erro!",
        text: error.response ? error.response.data.message : error?.message || error,
        showCloseButton: true,
        type: "error",
      });
    } finally {
      dispatch(setLoading(false));
    }
  },
};
