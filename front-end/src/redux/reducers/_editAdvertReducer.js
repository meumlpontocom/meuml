import {
  EDIT_AD_SET_LOADING,
  EDIT_AD_SAVE_ADVERT_DATA,
  EDIT_AD_UPDATE_FORM_DATA,
  EDIT_AD_TOGGLE_HIGHLIGHT,
  EDIT_AD_RESET_FORM,
  EDIT_AD_RESET_STORE,
  EDIT_AD_SET_TOGGLE_ATTRIBUTES,
} from "../actions/action-types";

const formInitialValue = {
  title: "",
  condition: "",
  price: "",
  shipping_tags: "",
  available_quantity: "",
  payments: [],
  listing_type_id: "",
  features: "",
  description: "",
  pictures: [],
  video_id: "",
  attributes: [],
};

const highlightInitialValue = {
  // CONTROLLER FUNCTION LOCATED AT INDEX.JS
  condition: false,
  title: false,
  price: false,
  premium: false,
  payment: false,
  shipping_tags: false,
  available_quantity: false,
  features: false,
  description: false,
  product_identifiers: false,
};

const INITIAL_STATE = {
  isLoading: false,
  advertData: {},
  form: formInitialValue,
  highlight: highlightInitialValue,
  toggleAttributes: false,
};

export default function _editAdvertReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case EDIT_AD_SET_TOGGLE_ATTRIBUTES:
      return {
        ...state,
        toggleAttributes: !state.toggleAttributes,
      };
    case EDIT_AD_RESET_STORE:
      return INITIAL_STATE;

    case EDIT_AD_RESET_FORM:
      return {
        ...state,
        form: formInitialValue,
      };

    case EDIT_AD_SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case EDIT_AD_SAVE_ADVERT_DATA:
      return {
        ...state,
        advertData: action.payload,
      };

    case EDIT_AD_UPDATE_FORM_DATA:
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.id]: action.payload.value,
        },
      };

    case EDIT_AD_TOGGLE_HIGHLIGHT:
      if (typeof state.highlight[action.payload] === "boolean") {
        return {
          ...state,
          highlight: {
            ...state.highlight,
            [action.payload]: !state.highlight[action.payload],
          },
        };
      }

      return state;

    default:
      return state;
  }
}
