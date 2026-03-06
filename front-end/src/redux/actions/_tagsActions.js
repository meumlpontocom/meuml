import {
  TAGS_TOGGLE_LOADING,
  TAGS_SAVE_TAG_LIST,
  TAGS_DELETE_SAVED_TAGS,
  TAGS_SAVE_SELECTED_TAGS,
  TAGS_TOGGLE_MODAL_IS_OPEN,
  TAGS_SAVE_MODAL_INPUT_VALUE,
  TAGS_SAVE_SELECTED_AD_TAG_LIST,
  TAGS_CREATE_NEW_TAG,
  TAGS_CLEAR_NEW_TAG_LIST,
  TAGS_SAVE_SELECTED_ADS_TAG_LIST,
  TAGS_HIDE_TAG,
  TAGS_CLEAR_HIDDEN_TAGS,
  TAGS_RESET_SELECTED,
  TAGS_RESET_STATE,
  TAGS_SAVE_TAG_PAGINATION,
} from "./action-types";

export function resetState() {
  return { type: TAGS_RESET_STATE };
}

export function toggleLoading(boolean) {
  return { type: TAGS_TOGGLE_LOADING, payload: boolean };
}

export function saveTagList(tagList) {
  return { type: TAGS_SAVE_TAG_LIST, payload: tagList };
}

export function saveTagPagination(pagination) {
  return { type: TAGS_SAVE_TAG_PAGINATION, payload: pagination };
}

export function saveSelectedTags(selected) {
  return { type: TAGS_SAVE_SELECTED_TAGS, payload: selected };
}

export function saveSelectedAdTagList(tagList) {
  return { type: TAGS_SAVE_SELECTED_AD_TAG_LIST, payload: tagList };
}

export function resetSelectedTags() {
  return { type: TAGS_RESET_SELECTED };
}

export function saveSelectedAdsTagList(tagList) {
  return { type: TAGS_SAVE_SELECTED_ADS_TAG_LIST, payload: tagList };
}

export function deleteSavedTags(id) {
  return { type: TAGS_DELETE_SAVED_TAGS, payload: id };
}

export function hideTag(tag) {
  return { type: TAGS_HIDE_TAG, payload: tag };
}

export function clearHiddenTags() {
  return { type: TAGS_CLEAR_HIDDEN_TAGS };
}

export function toggleModalIsOpen() {
  return { type: TAGS_TOGGLE_MODAL_IS_OPEN };
}

export function saveModalInputValue(value) {
  return { type: TAGS_SAVE_MODAL_INPUT_VALUE, payload: value };
}

export function createNewTag(string) {
  return { type: TAGS_CREATE_NEW_TAG, payload: string };
}

export function clearNewTagList() {
  return { type: TAGS_CLEAR_NEW_TAG_LIST };
}
