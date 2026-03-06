import {
  QUALITY_DETAILS_TOGGLE_LOADING,
  QUALITY_DETAILS_SAVE_DETAILS,
} from "./action-types";

export function toggleLoading() {
  return { type: QUALITY_DETAILS_TOGGLE_LOADING };
}

export function saveQualityDetails(data) {
  return { type: QUALITY_DETAILS_SAVE_DETAILS, payload: data };
}
