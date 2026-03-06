import { DISCOUNT_ACTION } from "../actions/action-types";
import api from "../../services/api";
import Swal from "sweetalert2";

const INITIAL_STATE = {
  id: null,
  initialDateTime: null,
  endingDateTime: null,
  discount: null,
  premiumDiscount: null,
  response: null,
};

export default function _discountReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case DISCOUNT_ACTION:
      return Object.assign(
        {},
        { ...state },
        {
          [action.payload.label]: action.payload.value,
        }
      );
    case "FETCH_DISCOUNT":
      async function fetchApi(body, confirmed = 0) {
        try {
          const baseURL = `/advertisings/discounts?confirmed=${confirmed}`;
          const response = await api.post(baseURL, { ...body });
          if (!confirmed) {
            Swal.fire({
              title: "Atenção",
              html: `<p>${response.data.message}</p>`,
              type: "question",
              showConfirmButton: true,
              confirmButtonText: "Prosseguir",
              showCancelButton: true,
              cancelButtonText: "Cancelar",
            }).then((user) => {
              if (user.value) {
                fetchApi(body, 1);
              }
            });
          } else {
            Swal.fire({
              title: "Atenção",
              type: response.data.status,
              html: `<p>${response.data.message}</p>`,
              showCloseButton: true,
            });
          }
          return { ...response };
        } catch (error) {
          if (error.response) {
            Swal.fire({
              title: "Atenção",
              html: `<p>${error.response.data.message}</p>`,
              type: error.response.data.status,
              showCloseButton: true,
            });
          } else
            Swal.fire({
              title: "Atenção",
              html: `<p>${error.message ? error.message : error}</p>`,
              type: "warning",
              showCloseButton: true,
            });
        }
      }
      function handleDiscount() {
        function getLocaletringWithoutSecsAndMillisecs(date) {
          const dStr = date.toLocaleString("pt-br"); //.toISOString();
          return dStr.substring(0, dStr.indexOf(":", dStr.indexOf(":") + 1));
        }
        function validateBody(body) {
          if (
            body.advertisings_id !== null &&
            body.advertisings_id &&
            body.start_date !== null &&
            body.start_date &&
            body.finish_date !== null &&
            body.finish_date &&
            body.buyers_discount_percentage !== null &&
            body.buyers_discount_percentage
          )
            return true;
          else return false;
        }
        const initDate = getLocaletringWithoutSecsAndMillisecs(
          new Date(state.initialDateTime)
        );
        const endDate = getLocaletringWithoutSecsAndMillisecs(
          new Date(state.endingDateTime)
        );
        const body = {
          advertisings_id: state.id,
          start_date: initDate,
          finish_date: endDate,
          buyers_discount_percentage: Number(state.discount) || 0,
          best_buyers_discount_percentage: Number(state.premiumDiscount) || 0,
        };
        if (validateBody({ ...body })) {
          Swal.close();
          return fetchApi({ ...body });
        } else {
          Swal.fire({
            title: "Atenção",
            html: `<p>Certifique-se de preencher todos os campos obrigatórios corretamente.</p>`,
            type: "warning",
            showCloseButton: true,
          });
        }
      }
      const response = handleDiscount();
      return {
        ...state,
        response: { ...response },
      };
    default:
      return state;
  }
}
