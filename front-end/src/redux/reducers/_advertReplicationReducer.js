import { checkIfAdvertIsValid } from "../actions/_replicationActions";
import {
  REPLICATION_BULK_UPDATE_DATA,
  REPLICATION_EDIT_SHOW_CONFIRM_BUTTON,
  REPLICATION_GO_TO_ADVERTS,
  REPLICATION_GO_TO_CONFIRMATION,
  REPLICATION_REPLICATE_SELF,
  REPLICATION_RESET_FILTER,
  REPLICATION_RESET_STORE,
  REPLICATION_SAVE_ADVERT_BEING_EDITED,
  REPLICATION_SAVE_ADVERT_DIMENSION_HEIGHT,
  REPLICATION_SAVE_ADVERT_DIMENSION_LENGTH,
  REPLICATION_SAVE_ADVERT_DIMENSION_WIDTH,
  REPLICATION_SAVE_ADVERT_WEIGHT,
  REPLICATION_SAVE_ADVERTS,
  REPLICATION_SAVE_AVAILABLE_CREDITS,
  REPLICATION_SAVE_CATEGORY,
  REPLICATION_SAVE_CHART,
  REPLICATION_SAVE_DIMENSION_HEIGHT,
  REPLICATION_SAVE_DIMENSION_LENGTH,
  REPLICATION_SAVE_DIMENSION_WIDTH,
  REPLICATION_SAVE_EDITED_ADVERT,
  REPLICATION_SAVE_GTIN,
  REPLICATION_SAVE_META,
  REPLICATION_SAVE_QUERY,
  REPLICATION_SAVE_SELECTED_ACCOUNTS,
  REPLICATION_SAVE_SELECTED_ADVERT,
  REPLICATION_SAVE_SHIPPING_MODES,
  REPLICATION_SAVE_SHIPPING_TERM,
  REPLICATION_SAVE_URL,
  REPLICATION_SAVE_WARRANTY_TIME,
  REPLICATION_SAVE_WARRANTY_TYPE,
  REPLICATION_SAVE_WEIGHT,
  REPLICATION_SELECT_ADVERT,
  REPLICATION_SELECT_ALL_FROM_PAGE,
  REPLICATION_SELECT_SHIPPING_MODE,
  REPLICATION_SET_FOUND_CHART,
  REPLICATION_SET_QUERY_CATEGORY,
  REPLICATION_SET_QUERY_KEYWORD,
  REPLICATION_SET_QUERY_NICKNAME,
  REPLICATION_SET_SELECTED_CATEGORY,
  REPLICATION_SET_REQUIRED_ATTRIBUTES,
  REPLICATION_TOGGLE_ALLOW_COPY_WARRANTY,
  REPLICATION_TOGGLE_COPY_SAME_ACCOUNT_ADS,
  REPLICATION_MODE,
  REPLICATION_TOGGLE_COPY_SAME_TITLE_ADS,
  REPLICATION_TOGGLE_COPY_SHIPPING_TERMS,
  REPLICATION_TOGGLE_CREATE_WITHOUT_WARRANTY,
  REPLICATION_TOGGLE_LOADING,
  REPLICATION_TOGGLE_SELECT_ALL_ADS,
  REPLICATION_UNSELECT_ALL_FROM_PAGE,
  REPLICATION_UPDATE_ADVERT_DATA,
  REPLICATION_UPDATE_ADVERT_DESCRIPTION,
  REPLICATION_UPDATE_PRICE_ACTIONS,
  REPLICATION_UPDATE_SEARCH_TYPE,
  ACCOUNTS_OFFICIAL_STORES,
  IS_LOADING_ACCOUNTS_OFFICIAL_STORES,
  REPLICATION_OFFICIAL_STORE,
} from "../actions/action-types";

const INITIAL_STATE = {
  self: false,
  selectedAccounts: [],
  adverts: [],
  selectedAdverts: [],
  selectedException: [],
  pagesSelected: [],
  advertBeingEdited: {},
  selectAll: false,
  isLoading: false,
  searchType: "keyword",
  filterCategory: null,
  query: "",
  url: "",
  queryParams: {
    nickname: "",
    keyword: "",
    category: null,
  },
  foundChart: false,
  editShowConfirmButton: false,
  allow_duplicated_title: false,
  allow_duplicated_account: false,
  allow_copying_warranty: false,
  create_without_warranty: false,
  view: 0, // 0 = adverts-table, 1 = confirmation-view
  availableCredits: 0,
  warrantType: "",
  warrantTime: "",
  shipping_term: 0,
  shippingModes: [],
  dimension: {
    height: 0,
    width: 0,
    length: 0,
  },
  weight: 0,
  categoryId: undefined,
  copyShippingTerm: true,
  selectedShippingMode: "",
  priceActions: {
    operation: "select", // increase or decrease
    operationType: "select", // percentage or value
    value: "",
  },
  bulkEdit: {
    listing_type_id: "keep_original",
    shipping: {
      free_shipping: "keep_original",
    },
    condition: "keep_original",
    available_quantity: "keep_original",
    description: "",
    confirmed: false,
    ean: "",
  },
  meta: {
    first_page: 1,
    last_page: 1,
    limit: 50,
    next_page: 1,
    offset: 0,
    page: 1,
    pages: 0,
    previous_page: 0,
    total: 0,
  },
  replication_mode: "standard",
  accountsOfficialStores: [],
  isLoadingAccountsOfficialStores: false,
  selectedOfficialStore: {},
};

export default function _advertReplicationReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case REPLICATION_TOGGLE_COPY_SHIPPING_TERMS:
      return {
        ...state,
        copyShippingTerm: !state.copyShippingTerm,
      };

    case REPLICATION_TOGGLE_CREATE_WITHOUT_WARRANTY: {
      return {
        ...state,
        create_without_warranty: !state.create_without_warranty,
      };
    }

    case REPLICATION_REPLICATE_SELF:
      return {
        ...state,
        self: !state.self,
      };

    case REPLICATION_SAVE_SELECTED_ACCOUNTS:
      return {
        ...state,
        selectedAccounts: action.payload,
      };

    case REPLICATION_SAVE_SHIPPING_MODES:
      return {
        ...state,
        shippingModes: [...new Set(action.payload)],
      };

    case REPLICATION_SELECT_SHIPPING_MODE:
      return {
        ...state,
        selectedShippingMode: action.payload,
      };

    case REPLICATION_UPDATE_PRICE_ACTIONS:
      return {
        ...state,
        priceActions: {
          ...state.priceActions,
          [action.payload.parameter]: action.payload.value,
        },
      };

    case REPLICATION_SAVE_SHIPPING_TERM:
      return {
        ...state,
        shipping_term: action.payload,
      };

    case REPLICATION_SAVE_WARRANTY_TIME:
      return {
        ...state,
        warrantTime: action.payload,
      };

    case REPLICATION_SAVE_WARRANTY_TYPE:
      return {
        ...state,
        warrantType: action.payload,
      };

    case REPLICATION_SAVE_AVAILABLE_CREDITS:
      return {
        ...state,
        availableCredits: action.payload,
      };

    case REPLICATION_TOGGLE_COPY_SAME_TITLE_ADS:
      return {
        ...state,
        allow_duplicated_title: !state.allow_duplicated_title,
      };

    case REPLICATION_TOGGLE_COPY_SAME_ACCOUNT_ADS:
      return {
        ...state,
        allow_duplicated_account: !state.allow_duplicated_account,
      };

    case REPLICATION_MODE:
      return {
        ...state,
        replication_mode: action.payload,
      };

    case ACCOUNTS_OFFICIAL_STORES:
      return {
        ...state,
        accountsOfficialStores: action.payload,
      };

    case IS_LOADING_ACCOUNTS_OFFICIAL_STORES:
      return {
        ...state,
        isLoadingAccountsOfficialStores: action.payload,
      };

    case REPLICATION_OFFICIAL_STORE:
      return {
        ...state,
        selectedOfficialStore: action.payload,
      };

    case REPLICATION_GO_TO_CONFIRMATION:
      return {
        ...state,
        view: 1,
      };

    case REPLICATION_GO_TO_ADVERTS:
      return {
        ...state,
        view: 0,
      };

    case REPLICATION_TOGGLE_LOADING:
      return {
        ...state,
        isLoading: !state.isLoading,
      };

    case REPLICATION_UPDATE_SEARCH_TYPE:
      return {
        ...state,
        searchType: action.payload,
        query: "",
      };

    case REPLICATION_SET_QUERY_CATEGORY:
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          category: action.payload,
        },
      };

    case REPLICATION_SET_QUERY_KEYWORD:
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          keyword: action.payload,
        },
      };

    case REPLICATION_SET_QUERY_NICKNAME:
      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          nickname: action.payload,
        },
      };

    case REPLICATION_RESET_FILTER:
      return {
        ...state,
        queryParams: {
          nickname: "",
          keyword: "",
          category: null,
        },
      };

    case REPLICATION_SAVE_ADVERTS:
      return {
        ...state,
        adverts: action.payload,
      };

    case REPLICATION_SAVE_META:
      return {
        ...state,
        meta: action.payload,
      };

    case REPLICATION_SELECT_ADVERT:
      if (!state.selectAll) {
        if (action.payload.checked) {
          let updateArray = [];
          for (const advert of state.adverts) {
            if (advert.id === action.payload.id) {
              updateArray.push(advert);
            }
          }
          return {
            ...state,
            selectedException: [],
            selectedAdverts: [...state.selectedAdverts, ...updateArray],
          };
        }
        return {
          ...state,
          selectedException: [],
          selectedAdverts: state.selectedAdverts.filter(advert => advert.id !== action.payload.id),
        };
      }
      return {
        ...state,
        selectedException: [...state?.selectedException, action.payload.id],
      };

    case REPLICATION_SELECT_ALL_FROM_PAGE:
      const { selectedAdverts, adverts } = state;
      const arrayWithDuplicates = [...selectedAdverts, ...adverts];
      const arrayWithoutDuplicates = arrayWithDuplicates.reduce((advertPack, advert) => {
        return advertPack.filter(ad => ad.id === advert.id).length ? advertPack : [...advertPack, advert];
      }, []);
      return {
        ...state,
        pagesSelected: [...new Set([...state.pagesSelected, state.meta.page])],
        selectedAdverts: [...arrayWithoutDuplicates],
      };

    case REPLICATION_UNSELECT_ALL_FROM_PAGE:
      return {
        ...state,
        pagesSelected: state.pagesSelected.filter(selected => selected !== state.meta.page),
        selectedAdverts: state.selectedAdverts.reduce((advertPack, advert) => {
          return state.adverts.filter(ad => ad.id === advert.id).length
            ? advertPack
            : [...advertPack, advert];
        }, []),
      };

    case REPLICATION_TOGGLE_SELECT_ALL_ADS:
      return {
        ...state,
        selectedAdverts: [],
        selectAll: !state.selectAll,
      };

    case REPLICATION_SAVE_QUERY:
      return {
        ...state,
        query: action.payload,
      };

    case REPLICATION_SAVE_URL:
      return {
        ...state,
        url: action.payload,
      };

    case REPLICATION_BULK_UPDATE_DATA:
      // If selectAll === false, selected advert's data will be
      // deleted in: replicateAdverts.js -> function createAdvertObject()
      // and bulkEdit data will be placed inside mass_override parameter to be sent to api
      if (action.payload.id === "free_shipping") {
        const translatedToBoolean =
          action.payload.value === "false" ? false : action.payload.value === false ? false : true;
        let bulkEdit = state.bulkEdit;
        bulkEdit["shipping"] = {
          free_shipping:
            typeof action.payload.value === "boolean" ? action.payload.value : translatedToBoolean,
        };
        return {
          ...state,
          bulkEdit,
        };
      } else if (action.payload.id === "available_quantity" && !action.payload.value) {
        return {
          ...state,
          bulkEdit: {
            ...state.bulkEdit,
            [action.payload.id]: "keep_original",
          },
        };
      }

      return {
        ...state,
        bulkEdit: {
          ...state.bulkEdit,
          [action.payload.id]: action.payload.value,
        },
      };

    case REPLICATION_SAVE_ADVERT_BEING_EDITED:
      return {
        ...state,
        advertBeingEdited: state.adverts.filter(advert => advert.id === action.payload)[0],
      };

    case REPLICATION_UPDATE_ADVERT_DATA:
      return {
        ...state,
        advertBeingEdited: {
          ...state.advertBeingEdited,
          [action.payload.parameter]: action.payload.value,
        },
      };

    case REPLICATION_UPDATE_ADVERT_DESCRIPTION:
      const { id, parameter, value } = action.payload;
      const advertIsSelected = state.selectedAdverts.filter(advert => advert.id === id);
      let advert = advertIsSelected.length
        ? advertIsSelected[0]
        : state.adverts.filter(advert => advert.id === id)[0];
      advert[parameter] = value;
      const updated = !advertIsSelected.length
        ? [...state.selectedAdverts, advert]
        : [...state.selectedAdverts.filter(advert => advert.id !== id), advert];
      return {
        ...state,
        selectedAdverts: [...updated],
      };

    case REPLICATION_SAVE_EDITED_ADVERT:
      const selectedAds = state.selectedAdverts.filter(ad => ad.id !== state.advertBeingEdited.id);
      return {
        ...state,
        selectedAdverts: [...selectedAds, { ...state.advertBeingEdited }],
      };

    case REPLICATION_TOGGLE_ALLOW_COPY_WARRANTY:
      return {
        ...state,
        allow_copying_warranty: !state.allow_copying_warranty,
      };

    case REPLICATION_RESET_STORE:
      return {
        ...INITIAL_STATE,
      };

    case REPLICATION_SAVE_GTIN:
      return {
        ...state,
        bulkEdit: {
          ...state.bulkEdit,
          gtin: action.payload,
        },
      };

    case REPLICATION_SAVE_DIMENSION_HEIGHT:
      return {
        ...state,
        dimension: {
          ...state.dimension,
          height: action.payload,
        },
      };

    case REPLICATION_SAVE_DIMENSION_WIDTH:
      return {
        ...state,
        dimension: {
          ...state.dimension,
          width: action.payload,
        },
      };

    case REPLICATION_SAVE_DIMENSION_LENGTH:
      return {
        ...state,
        dimension: {
          ...state.dimension,
          length: action.payload,
        },
      };

    case REPLICATION_SAVE_WEIGHT:
      return {
        ...state,
        weight: action.payload,
      };

    case REPLICATION_SAVE_SELECTED_ADVERT:
      return {
        ...state,
        selectedAdverts: [...state.selectedAdverts, action.payload],
      };

    case REPLICATION_SET_SELECTED_CATEGORY:
      const { id: advertId, categoryId, shopeeRequiredAttributes } = action.payload;

      return {
        ...state,
        selectedAdverts: state.selectedAdverts.map(item => {
          if (item.id === advertId) {
            const isComplete = checkIfAdvertIsValid(item.dimension, item.weight, categoryId);

            return {
              ...item,
              categoryId: categoryId,
              isComplete,
              shopeeRequiredAttributes: shopeeRequiredAttributes,
            };
          } else {
            return item;
          }
        }),
      };

    case REPLICATION_SET_REQUIRED_ATTRIBUTES:
      const { id: shopeeAdvertId, requiredAttributes } = action.payload;

      return {
        ...state,
        selectedAdverts: state.selectedAdverts.map(item => {
          if (item.id === shopeeAdvertId) {
            return {
              ...item,
              shopeeRequiredAttributes: requiredAttributes,
            };
          }

          return item;
        }),
      };

    case REPLICATION_SAVE_CATEGORY:
      return {
        ...state,
        categoryId: action.payload,
      };

    case REPLICATION_SAVE_ADVERT_DIMENSION_HEIGHT:
      return {
        ...state,
        selectedAdverts: state.selectedAdverts.map(item => {
          if (item.id === action.payload.id) {
            const dimension = {
              ...item.dimension,
              height: action.payload.height,
            };

            const isComplete = checkIfAdvertIsValid(dimension, item.height, item.categoryId);

            return {
              ...item,
              dimension,
              isComplete,
            };
          } else {
            return item;
          }
        }),
      };

    case REPLICATION_SAVE_ADVERT_DIMENSION_LENGTH:
      return {
        ...state,
        selectedAdverts: state.selectedAdverts.map(item => {
          if (item.id === action.payload.id) {
            const dimension = {
              ...item.dimension,
              length: action.payload.length,
            };

            const isComplete = checkIfAdvertIsValid(dimension, item.length, item.categoryId);

            return {
              ...item,
              dimension,
              isComplete,
            };
          } else {
            return item;
          }
        }),
      };

    case REPLICATION_SAVE_ADVERT_DIMENSION_WIDTH:
      return {
        ...state,
        selectedAdverts: state.selectedAdverts.map(item => {
          if (item.id === action.payload.id) {
            const dimension = {
              ...item.dimension,
              width: action.payload.width,
            };

            const isComplete = checkIfAdvertIsValid(dimension, item.weight, item.categoryId);

            return {
              ...item,
              dimension,
              isComplete,
            };
          } else {
            return item;
          }
        }),
      };

    case REPLICATION_SAVE_ADVERT_WEIGHT:
      return {
        ...state,
        selectedAdverts: state.selectedAdverts.map(item => {
          if (item.id === action.payload.id) {
            const isComplete = checkIfAdvertIsValid(item.dimension, action.payload.weight, item.categoryId);

            return {
              ...item,
              weight: action.payload.weight,
              isComplete,
            };
          } else {
            return item;
          }
        }),
      };

    case REPLICATION_SAVE_CHART:
      return {
        ...state,
        advertBeingEdited: {
          ...state.advertBeingEdited,
          attributes: state.advertBeingEdited.attributes.map(attribute => {
            if (attribute.id === "SIZE_GRID_ID") {
              return {
                ...attribute,
                value_name: action.payload,
              };
            } else {
              return attribute;
            }
          }),
        },
      };

    case REPLICATION_SET_FOUND_CHART:
      return {
        ...state,
        foundChart: action.payload,
      };

    case REPLICATION_EDIT_SHOW_CONFIRM_BUTTON:
      return {
        ...state,
        editShowConfirmButton: action.payload,
      };

    default:
      return state;
  }
}
