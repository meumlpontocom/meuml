import {
  MODERATION_SAVE_META,
  MODERATION_TOGGLE_LOADING,
  MODERATION_SAVE_SELECTED_FROM_DATE,
  MODERATION_SAVE_SELECTED_TO_DATE,
  MODERATION_SAVE_SELECTED_ACCOUNT,
  MODERATION_SAVE_MODERATIONS_DATA,
  MODERATION_SAVE_ADS_MODERATED_PER_ACCOUNT
} from "../actions/action-types";

const newDate = new Date().toLocaleDateString().split("/").reverse().join("-");

const INITIAL_STATE = {
  meta: {},
  loading: false,
  moderations: [],
  selectedAccount: [],
  selectedToDate: newDate,
  selectedFromDate: newDate,
  adsModeratedPerAccount: [],
};

export default function _moderationReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case MODERATION_SAVE_ADS_MODERATED_PER_ACCOUNT:
      return {
        ...state,
        adsModeratedPerAccount: action.payload,
      }

    case MODERATION_SAVE_SELECTED_ACCOUNT:
      return {
        ...state,
        selectedAccount: [action.payload],
      };

    case MODERATION_SAVE_SELECTED_FROM_DATE:
      return {
        ...state,
        selectedFromDate: action.payload,
      };

    case MODERATION_SAVE_SELECTED_TO_DATE:
      return {
        ...state,
        selectedToDate: action.payload,
      };

    case MODERATION_TOGGLE_LOADING:
      return {
        ...state,
        loading: !state.loading,
      };

    case MODERATION_SAVE_MODERATIONS_DATA:
      return {
        ...state,
        moderations: [...action.payload],
      };

    case MODERATION_SAVE_META:
      return {
        ...state,
        meta: action.payload,
      };

    default:
      return state;
  }
}
