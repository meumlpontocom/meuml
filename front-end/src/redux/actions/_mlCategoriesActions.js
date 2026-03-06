import { SAVE_ML_CATEGORIES, SET_ML_CATEGORIES_LOADING, SET_ML_CATEGORIES_PATH } from "./action-types";

export function saveMlCategories(data) {
  return { type: SAVE_ML_CATEGORIES, payload: data };
}

export function setMlCategoriesLoading(isLoading) {
  return { type: SET_ML_CATEGORIES_LOADING, payload: isLoading };
}

export function setMlCategoriesPath(path) {
  return { type: SET_ML_CATEGORIES_PATH, payload: path };
}
