import {
  RESET_PATH_ML_CATEGORIES,
  SAVE_ML_CATEGORIES,
  SET_ML_CATEGORIES_LOADING,
  SET_ML_CATEGORIES_PATH,
} from "../actions/action-types";

const INITIAL_STATE = {
  isLoading: false,
  categoriesIndex: [],
  path: [],
};

export default function _mlCategoriesReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SAVE_ML_CATEGORIES:
      return {
        ...state,
        categoriesIndex: action.payload,
      };

    case SET_ML_CATEGORIES_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case SET_ML_CATEGORIES_PATH:
      return {
        ...state,
        path: action.payload,
      };

    case RESET_PATH_ML_CATEGORIES:
      return {
        ...state,
        path: [],
      };

    default:
      return state;
  }
}
