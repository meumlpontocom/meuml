import {
  SAVE_FORM_POPUP_DATA,
  SAVE_FORM_POPUP_URL,
  FETCH_HEADER_FOOTER_API_FORM_POPUP,
  FETCH_REPLACE_TEXT_API_FORM_POPUP,
  FETCH_ALTER_TEXT_API_FORM_POPUP,
  FETCH_ALTER_PRICE_API_FORM_POPUP,
  FETCH_ALTER_MANUFACTURING_TIME,
  FLEX_SHIPPING_ACTIVATE,
  FLEX_SHIPPING_DEACTIVATE,
} from "../actions/action-types";
import api from "../../services/api";
import Swal from "sweetalert2";

const INITIAL_STATE = {
  url: "",
  header: "",
  footer: "",
  toBeReplacedText: "",
  replaceText: "",
  description: "",
  alterPrice: "",
  advertId: "",
  response: {},
};

export default function _formPopupReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case SAVE_FORM_POPUP_DATA:
      return Object.assign(
        {},
        { ...state },
        { [action.payload.label]: action.payload.value }
      );
    case SAVE_FORM_POPUP_URL:
      return { ...state, url: action.payload.url };
    case FLEX_SHIPPING_ACTIVATE:
      fetchHandler({
        url: state.url,
        params: { advertisings_id: state.advertId, activate: 1 },
      });
      return INITIAL_STATE;
    case FLEX_SHIPPING_DEACTIVATE:
      fetchHandler({
        url: state.url,
        params: { advertisings_id: state.advertId, activate: 0 },
      });
      return INITIAL_STATE;
    case FETCH_HEADER_FOOTER_API_FORM_POPUP:
      fetchHandler({
        url: state.url,
        params: {
          header: state.header,
          footer: state.footer,
          advertisings_id: state.advertId,
        },
      });
      return INITIAL_STATE;
    case FETCH_REPLACE_TEXT_API_FORM_POPUP:
      fetchHandler({
        url: state.url,
        params: {
          replace_from: state.toBeReplacedText,
          replace_to: state.replaceText,
          advertisings_id: state.advertId,
        },
      });
      return INITIAL_STATE;
    case FETCH_ALTER_TEXT_API_FORM_POPUP:
      fetchHandler({
        url: state.url,
        params: {
          description: state.description,
          advertisings_id: state.advertId,
        },
      });
      return INITIAL_STATE;
    case FETCH_ALTER_PRICE_API_FORM_POPUP:
      fetchHandler({
        url: state.url,
        params: {
          price_rate: state.alterPrice,
          price_premium: state.alterPrice,
          price_classic: state.alterPrice,
          price_free: state.alterPrice,
          advertisings_id: state.advertId,
        },
      });
      return INITIAL_STATE;
    case FETCH_ALTER_MANUFACTURING_TIME:
      fetchHandler({
        url: state.url,
        params: {
          days: state.days,
          advertisings_id: state.advertId,
        },
      });
      return INITIAL_STATE;

    default:
      return state;
  }
}

async function fetchHandler({ url, params }) {
  try {
    const confirmed = Number(url.split("?")[1].split("&")[0].split("=")[1]);
    const formData = new FormData();
    for (const iterator in params) {
      formData.append(iterator.toString(), params[iterator]);
    }
    let response = {};
    if (url.split("/shipping/mercado-envios-flex/").length === 2) {
      response = await api.put(url, formData);
    } else {
      response = await api.post(url, formData);
    }
    if (!confirmed) {
      Swal.fire({
        title: "Atenção",
        html: `<p>${response.data.message}</p>`,
        type: "question",
        showConfirmButton: !confirmed,
        confirmButtonText: "Prosseguir",
        showCancelButton: !confirmed,
        cancelButtonText: "Cancelar",
      }).then((user) => {
        if (confirmed === 0) {
          if (user.value) {
            const pureURL = url.split("?")[0];
            const selectAll = url.split("select_all=")[1];
            const _url = `${pureURL}?confirmed=1&select_all=${selectAll}`;
            fetchHandler({
              url: _url,
              params,
            });
          }
        }
      });
    } else {
      Swal.fire({
        title: "Atenção",
        html: `<p>${response.data.message}</p>`,
        type: response.data.status,
        showCloseButton: true,
      }).then(user => {
        if (url.split("/shipping/mercado-envios-flex/").length === 2) {
          window.location.reload();
        }
      });
    }
    return response;
  } catch (error) {
    if (error.response) {
      Swal.fire({
        title: "Atenção",
        html: `<p>${error.response.data.message}</p>`,
        type: error.response.data.status,
        showCloseButton: true,
      });
    } else {
      Swal.fire({
        title: "Atenção",
        html: `<p>${error.message ? error.message : error}</p>`,
        type: "error",
        showCloseButton: true,
      });
    }
    return error;
  }
}
