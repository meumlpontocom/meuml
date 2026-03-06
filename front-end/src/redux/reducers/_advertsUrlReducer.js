import produce from "immer";
import { ADVERTS_URL, CLEAR_URL_STATE } from "../actions/action-types";

const INITIAL_STATE = "sort_order=desc&free_shipping=1,0";

export default function _advertsUrlReducer(state = INITIAL_STATE, action) {
  return produce(state, draft => {
    switch (action.type) {
      case ADVERTS_URL: {
        return action.url;
      }
      case CLEAR_URL_STATE: {
        return INITIAL_STATE;
      }
      default:
        return state;
    }
  });

  // if (state.length === 0) {
  //   return INITIAL_STATE;
  // }

  // if (action.type === ADVERTS_URL) {
  //   const updatedData = action.url;
  //   return updatedData;
  // }
  // default:
  // return state;
}
