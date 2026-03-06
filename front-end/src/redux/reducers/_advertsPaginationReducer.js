import { SAVE_ADVERTS_PAGINATION } from '../actions/action-types';

const INITIAL_STATE = {
  "first_page": 0,
  "last_page": 0,
  "limit": 50,
  "next_page": 0,
  "offset": 50,
  "page": 0,
  "pages": 1,
  "previous_page": 0,
  "total": 0
};

export default function _advertsPaginationReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  if (action.type === SAVE_ADVERTS_PAGINATION) {
    const updatedData = { ...state, ...action.payload };
    return updatedData;
  }

  return state;
}
