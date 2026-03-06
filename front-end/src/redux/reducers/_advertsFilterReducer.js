import { FILTER_ADVERTS, CLEAR_FILTER_STATE } from "../actions/action-types";

const INITIAL_STATE = {
  accounts: {},
  status: {},
  free_shipping: {},
  sort_order: {},
  filter_tags_and_catalog: {},
  filter_string: {}
};

export default function _filterAdverts(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  if (action.type === FILTER_ADVERTS) {
    const udpatedData = { ...state, ...action.payload };
    return udpatedData;
  }

  if (action.type === CLEAR_FILTER_STATE) {
    return INITIAL_STATE;
  }

  return state;
}
