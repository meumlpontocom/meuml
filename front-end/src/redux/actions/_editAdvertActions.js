import {
  EDIT_AD_SET_LOADING,
  EDIT_AD_SAVE_ADVERT_DATA,
  EDIT_AD_UPDATE_FORM_DATA,
  EDIT_AD_TOGGLE_HIGHLIGHT,
  EDIT_AD_RESET_FORM,
  EDIT_AD_RESET_STORE,
  EDIT_AD_SET_TOGGLE_ATTRIBUTES,
} from "./action-types";

export function setLoading(boolean) {
  return { type: EDIT_AD_SET_LOADING, payload: boolean };
}

export function saveAdvertData(advertObject) {
  return { type: EDIT_AD_SAVE_ADVERT_DATA, payload: advertObject };
}

export function updateFormData(id, value) {
  return { type: EDIT_AD_UPDATE_FORM_DATA, payload: { id, value } };
}

export function toggleHighlight(inputId) {
  return { type: EDIT_AD_TOGGLE_HIGHLIGHT, payload: inputId };
}

export function resetForm() {
  return { type: EDIT_AD_RESET_FORM };
}

export function resetStore() {
  return { type: EDIT_AD_RESET_STORE };
}

export function setToggleAttributes() {
  return { type: EDIT_AD_SET_TOGGLE_ATTRIBUTES };
}
