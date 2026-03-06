import { SAVE_ADVERTS, CLEAR_ADS_STATE } from "../actions/action-types";

const INITIAL_STATE = [
  {
    attributes: {},
    id: "noADVERTS",
    type: "advertising"
  }
];

export default function _advertsReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case SAVE_ADVERTS:
      const updatedData = { ...state, ...action.payload };
      return updatedData;
    case CLEAR_ADS_STATE:
      return INITIAL_STATE;
    default:
      return state;
  }
}
