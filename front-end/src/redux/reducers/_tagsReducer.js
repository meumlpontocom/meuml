import {
  TAGS_TOGGLE_LOADING,
  TAGS_SAVE_TAG_LIST,
  TAGS_SAVE_SELECTED_AD_TAG_LIST,
  TAGS_SAVE_SELECTED_ADS_TAG_LIST,
  TAGS_DELETE_SAVED_TAGS,
  TAGS_TOGGLE_MODAL_IS_OPEN,
  TAGS_SAVE_MODAL_INPUT_VALUE,
  TAGS_SAVE_SELECTED_TAGS,
  TAGS_CREATE_NEW_TAG,
  TAGS_CLEAR_NEW_TAG_LIST,
  TAGS_HIDE_TAG,
  TAGS_CLEAR_HIDDEN_TAGS,
  TAGS_RESET_SELECTED,
  TAGS_RESET_STATE,
  TAGS_SAVE_TAG_PAGINATION,
} from "../actions/action-types";

const INITIAL_STATE = {
  tags: [],
  selectedTags: [],
  selectedAdvertTags: [],
  notSavedTags: [],
  modalIsOpen: false,
  modalInputValue: "",
  isLoading: false,
  hiddenTags: [],
  meta: {
    first_page: 1,
    last_page: 0,
    limit: 50,
    next_page: 2,
    offset: 0,
    page: 1,
    pages: 1,
    previous_page: 0,
    total: 0,
  },
};

export default function _tagsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case TAGS_SAVE_TAG_PAGINATION:
      return {
        ...state,
        meta: action.payload,
      };

    case TAGS_RESET_STATE:
      return INITIAL_STATE;

    case TAGS_RESET_SELECTED:
      return {
        ...state,
        selectedTags: [],
      };

    case TAGS_CLEAR_NEW_TAG_LIST:
      return {
        ...state,
        notSavedTags: [],
      };

    case TAGS_CREATE_NEW_TAG:
      const newTags =
        typeof action.payload === "string"
          ? [action.payload]
          : [...action.payload];

      return {
        ...state,
        notSavedTags: [...state.notSavedTags, ...newTags],
      };

    case TAGS_SAVE_SELECTED_TAGS:
      return {
        ...state,
        selectedTags: action.payload,
      };

    case TAGS_SAVE_MODAL_INPUT_VALUE:
      return {
        ...state,
        modalInputValue: action.payload.toString().toUpperCase(),
      };

    case TAGS_TOGGLE_MODAL_IS_OPEN:
      return {
        ...state,
        modalIsOpen: !state.modalIsOpen,
      };
    case TAGS_TOGGLE_LOADING:
      return {
        ...state,
        isLoading:
          typeof action.payload === "boolean"
            ? action.payload
            : !state.isLoading,
      };

    case TAGS_SAVE_SELECTED_AD_TAG_LIST:
      return {
        ...state,
        selectedAdvertTags: action.payload,
      };

    case TAGS_SAVE_SELECTED_ADS_TAG_LIST:
      return {
        ...state,
        selectedAdvertTags: [...state.selectedAdvertTags, ...action.payload],
      };

    case TAGS_SAVE_TAG_LIST:
      return {
        ...state,
        tags: [...state.tags, ...action.payload].reduce((prev, tag) => {
          if (prev.filter((_tag) => _tag.id === tag.id).length) {
            return prev;
          } else {
            return [...prev, tag];
          }
        }, []),
      };

    case TAGS_DELETE_SAVED_TAGS:
      return {
        ...state,
        tags: [...state.tags.filter(({ id }) => id !== action.payload)],
      };

    case TAGS_HIDE_TAG:
      return {
        ...state,
        hiddenTags: [...state.hiddenTags, action.payload],
      };

    case TAGS_CLEAR_HIDDEN_TAGS:
      return {
        ...state,
        hiddenTags: [],
      };

    default:
      return state;
  }
}
