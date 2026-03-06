import api from "../../services/api";
import { CHANGE_ADVERT_CATALOG, CATALOG_OPT_IN } from "../actions/action-types";
import Swal from "sweetalert2";

const INITIAL_STATE = {
  url: "",
};

async function fetchAPI({ url }) {
  try {
    const response = await api.post(url);
    if (response) {
      Swal.fire({
        title: "Atenção",
        html: `<p>${response.data.message}</p>`,
        type: response.data.status,
        showCloseButton: true,
      });
    }
  } catch (error) {
    return error;
  }
}

export default function _changeCatalogReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case CATALOG_OPT_IN:
      fetchAPI({ url: `/catalog/${action.payload}/publish/all`})
      return state;
    
    case CHANGE_ADVERT_CATALOG:
      const title = action.payload.name;
      const productId = action.payload.id;
      const catalogAdvertId = action.payload.advertId;
      const url = `/catalog/replace?new_catalog_product_name=${title}&new_catalog_product_id=${productId}&catalog_advertising_id=${catalogAdvertId}`;

      return {
        url,
      };

    case "FETCH_CHANGE_CATALOG":
      return fetchAPI({ url: state.url });

    
    default:
      return state;
  }
}
