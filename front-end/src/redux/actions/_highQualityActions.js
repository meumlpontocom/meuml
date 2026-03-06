import {
  HIGH_QUALITY_TOGGLE_LOADING,
  HIGH_QUALITY_SAVE_ADVERT_ID,
  HIGH_QUALITY_SAVE_ADVERT_DATA,
  HIGH_QUALITY_SAVE_NEW_TITLE,
  HIGH_QUALITY_SAVE_NEW_DESCRIPTION,
  HIGH_QUALITY_SAVE_NEW_GTIN,
  HIGH_QUALITY_REMOVE_ADVERT_IMAGE,
  HIGH_QUALITY_SAVE_ACCOUNT_ID,
  HIGH_QUALITY_SAVE_NEW_ADVERT_IMAGE,
  HIGH_QUALITY_SAVE_ERRORS,
} from "./action-types";

export function toggleIsLoading() {
  return { type: HIGH_QUALITY_TOGGLE_LOADING };
}

export function saveAdvertId(id) {
  return { type: HIGH_QUALITY_SAVE_ADVERT_ID, payload: id };
}

export function saveAccountId(id) {
  return { type: HIGH_QUALITY_SAVE_ACCOUNT_ID, payload: id };
}

export function saveAdvertData(data) {
  return {
    type: HIGH_QUALITY_SAVE_ADVERT_DATA,
    payload: data,
  };
}

export function highQualitySaveNewTitle(newTitle) {
  return { type: HIGH_QUALITY_SAVE_NEW_TITLE, payload: newTitle };
}

export function highQualitySaveNewDescription(newDescription) {
  return { type: HIGH_QUALITY_SAVE_NEW_DESCRIPTION, payload: newDescription };
}

export function highQualitySaveNewGtin(newGtin) {
  return { type: HIGH_QUALITY_SAVE_NEW_GTIN, payload: newGtin };
}

export function removeAdvertImage(index) {
  return { type: HIGH_QUALITY_REMOVE_ADVERT_IMAGE, payload: index };
}

export function saveNewAdvertPicture(pictureId) {
  return { type: HIGH_QUALITY_SAVE_NEW_ADVERT_IMAGE, payload: pictureId };
}

export function saveErrors(errors) {
  return { type: HIGH_QUALITY_SAVE_ERRORS, payload: errors };
}
