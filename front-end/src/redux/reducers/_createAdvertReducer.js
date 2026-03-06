import {
  UPDATE_SPECS,
  SAVE_CATEGORY_LIST,
  SET_PREDICTED_CATEGORY,
  CONFIRM_PATH_AS_CATEGORY,
  CONFIRM_PREDICTED_CATEGORY,
  SAVE_FORM_DATA,
  CREATE_ADVERT_SAVE_VARIATION,
  CREATE_ADVERT_DELETE_VARIATION,
  CREATE_ADVERT_SAVE_DESCRIPTION,
  CREATE_ADVERT_CATALOG_OPTIONS,
} from "../actions/action-types";
import tryParseJSON from "../../helpers/tryParseJSON";

const INITIAL_STATE = {
  path: [], // objects have name and id properties
  confirmedCategoryAttributes: [],
  confirmedCategory: {
    attributes: [],
  },
  advertImages: [],
  predictedCategory: {},
  categoryListOptions: [],
  formData: {
    "Título/title": "",
    "Quantidade/available_quantity": 0,
    "Condição/condition": "",
    "Anúncio/listing_type_id": "",
    "Descrição/description": "",
    "Preço/price": { id: 0, name: "price" },
  },
  step: 0,
  variations: [],
  catalogOptions: [],
};

export default function _createAdvertReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CREATE_ADVERT_CATALOG_OPTIONS:
      return {
        ...state,
        catalogOptions: [...action.payload],
      };

    case "CREATE_ADVERT_NEXT_STEP":
      if (state.step <= 2) {
        return {
          ...state,
          step: state.step + 1,
        };
      }
      break;
    case "CREATE_ADVERT_PREVIOUS_STEP":
      if (state.step >= 1) {
        return {
          ...state,
          step: state.step - 1,
        };
      }
      break;
    case "CANCEL_ADVERT_CREATION":
      return INITIAL_STATE;
    case "UPLOAD_IMAGE":
      return {
        ...state,
        advertImages: [...state.advertImages, action.payload],
      };
    case CREATE_ADVERT_SAVE_DESCRIPTION:
      return {
        ...state,
        formData: {
          ...state.formData,
          [`${action.payload.name}/${action.payload.id}`]: {
            name: action.payload.id,
            id: action.payload.value,
          },
        },
      };
    case CREATE_ADVERT_DELETE_VARIATION:
      let update = {
        ...state,
      };
      update.variations.splice(action.payload, 1);
      return {
        ...update,
      };
    case CREATE_ADVERT_SAVE_VARIATION:
      return {
        ...state,
        variations: [...state.variations, { ...action.payload }],
      };
    case UPDATE_SPECS:
      return {
        ...state,
        [action.payload.param]: action.payload.value,
      };
    case SAVE_FORM_DATA:
      if (action.payload.param) {
        const objectValue = tryParseJSON(action.payload.value);
        if (!objectValue) {
          return {
            ...state,
            formData: {
              ...state.formData,
              [action.payload.param]: {
                name: action.payload.param.split("/")[1],
                id: action.payload.value,
              },
            },
          };
        }
        return {
          ...state,
          formData: {
            ...state.formData,
            [action.payload.param]: {
              ...objectValue,
            },
          },
        };
      }
      return state;
    case SAVE_CATEGORY_LIST:
      return {
        ...state,
        categoryListOptions: action.payload,
      };
    case SET_PREDICTED_CATEGORY:
      return {
        ...state,
        predictedCategory: action.payload,
      };
    case CONFIRM_PREDICTED_CATEGORY:
      return {
        ...state,
        confirmedCategory: state.predictedCategory,
      };
    case CONFIRM_PATH_AS_CATEGORY:
      return {
        ...state,
        confirmedCategory: {
          attributes: [],
          category_id: state.path.slice(-1)[0].id,
          category_name: state.path.slice(-1)[0].name,
        },
      };
    default:
      return {
        ...state,
      };
  }
}
