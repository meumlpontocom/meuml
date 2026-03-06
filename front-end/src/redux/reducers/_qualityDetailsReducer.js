import {
  QUALITY_DETAILS_TOGGLE_LOADING,
  QUALITY_DETAILS_SAVE_DETAILS,
} from "../actions/action-types";

const INITIAL_STATE = {
  actions: [
    { description: "publicar em catálogo.", id: "buybox", name: "buybox" },
  ],
  goals: [
    {
      apply: true,
      data: { 57424303735: true },
      description: "publicar em catálogo.",
      id: "buybox",
    },
  ],
  id: "MLB1549074149",
  level: "Qualidade Básica",
  quality: 66,
  loading: false,
};

export default function _qualityDetailsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case QUALITY_DETAILS_TOGGLE_LOADING:
      return {
        ...state,
        loading: !state.loading,
      };

    case QUALITY_DETAILS_SAVE_DETAILS:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
