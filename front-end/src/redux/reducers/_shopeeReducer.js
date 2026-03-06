import {
  SHOPEE_SET_ADVERTS,
  SHOPEE_SET_LOADING,
  SHOPEE_SET_ADVERTS_PAGINATION,
  SHOPEE_SET_SELECTED_ACCOUNT_LIST,
  SHOPEE_SET_SALES_FILTER_STRING,
  SHOPEE_SET_ADS_FILTER_STRING,
  SHOPEE_SET_SELECTED_ADVERTS,
  SHOPEE_SET_SELECTED_ALL_ADS,
  SHOPEE_SET_REPLICATION_COPY_SAME,
  SHOPEE_RESET_STATES,
  SHOPEE_SET_STOCK_FILTER,
  SHOPEE_SET_SORT,
  SHOPEE_SELECT_ALL_ADS_FROM_PAGE,
  SHOPEE_CATEGORIES_TREE,
  SET_SHOPEE_CATEGORIES_TREE_LOADING,
} from "../actions/action-types";

const INITIAL_STATE = {
  advertising: {
    replication: {},
    selectedAccounts: [],
    isLoading: false,
    list: {},
    selected: {},
    selectAll: false,
    filters: {
      status: [],
      condition: [],
      string: "",
      stock: { label: "Qualquer estoque", value: false },
      sort: null,
    },
    pagination: {
      first_page: 1,
      last_page: 1,
      limit: 50,
      next_page: 1,
      offset: 0,
      page: 0,
      pages: 2,
      previous_page: -1,
      total: 0,
    },
  },
  sales: {
    isCardOpen: {},
    filterString: "",
    selectedAccounts: [],
    isLoading: false,
    list: {},
    pagination: {
      page: 0,
      next_page: 0,
      previous_page: 0,
      last_page: 0,
      first_page: 0,
      total: 0,
    },
    selected: {},
    selectAll: false,
  },
  accounts: {},
  categoriesTree: {
    data: [],
    isLoading: false,
  },
};

export default function _shopeeReducer(state = INITIAL_STATE, action) {
  const currentView = window.location.href.split("#/")[1];
  switch (action.type) {
    case SHOPEE_SELECT_ALL_ADS_FROM_PAGE:
      const allPageChecked = Object.values(state.advertising.selected).every(ad => ad.checked);
      const toggledPageSelection = {};
      Object.values(state.advertising.selected).forEach(ad => {
        toggledPageSelection[ad.id] = { ...ad, checked: !allPageChecked };
      });
      return {
        ...state,
        advertising: {
          ...state.advertising,
          selected: toggledPageSelection,
        },
      };

    case SHOPEE_SET_SORT:
      return {
        ...state,
        advertising: {
          ...state.advertising,
          filters: {
            ...state.advertising.filters,
            sort: action.payload,
          },
        },
      };

    case SHOPEE_SET_STOCK_FILTER:
      return {
        ...state,
        advertising: {
          ...state.advertising,
          filters: {
            ...state.advertising.filters,
            stock: action.selectedFilter,
          },
        },
      };

    case SHOPEE_RESET_STATES:
      return INITIAL_STATE;

    case SHOPEE_SET_REPLICATION_COPY_SAME:
      return {
        ...state,
        advertising: {
          ...state.advertising,
          replication: {
            ...state.advertising.replication,
            [action.label]: action.value,
          },
        },
      };

    case SHOPEE_SET_SELECTED_ALL_ADS:
      let updatedAdvertSelectionState = {};
      Object.values(state.advertising.selected).forEach(advert => {
        updatedAdvertSelectionState[advert.id] = {
          ...advert,
          checked: action.payload,
        };
      });
      return {
        ...state,
        advertising: {
          ...state.advertising,
          selectAll: action.payload,
          selected: updatedAdvertSelectionState,
        },
      };

    case SHOPEE_SET_SELECTED_ADVERTS:
      const { id } = action.payload;
      return {
        ...state,
        advertising: {
          ...state.advertising,
          selected: {
            ...state.advertising.selected,
            [id]: action.payload,
          },
        },
      };
    case SHOPEE_SET_ADS_FILTER_STRING:
      return {
        ...state,
        advertising: {
          ...state.advertising,
          filters: {
            ...state.advertising.filters,
            [action.payload.filter]: action.payload.value,
          },
        },
      };
    case SHOPEE_SET_SALES_FILTER_STRING:
      return {
        ...state,
        sales: {
          ...state.sales,
          filterString: action.payload,
        },
      };

    case SHOPEE_SET_SELECTED_ACCOUNT_LIST:
      switch (currentView) {
        case "anuncios-shopee":
          return {
            ...state,
            advertising: {
              ...state.advertising,
              selectedAccounts: action.payload,
            },
          };

        case "vendas-shopee":
          return {
            ...state,
            sales: {
              ...state.sales,
              selectedAccounts: action.payload,
            },
          };

        default:
          return state;
      }

    case SHOPEE_SET_ADVERTS:
      if (JSON.stringify(action.payload) !== "{}") {
        const selectionStateUpdated = action.payload.reduce(
          (previous, current) => {
            if (state.advertising.selected[current.id]) {
              return previous;
            }
            return {
              ...previous,
              [current.id]: {
                checked: state.advertising.selectAll,
                id: current.id,
                account_id: current.account_id,
              },
            };
          },
          { ...state.advertising.selected },
        );
        const previousAdvertisingData = { ...state.advertising };
        const advertising = Object.assign({}, previousAdvertisingData, {
          list: action.payload,
          selected: selectionStateUpdated,
        });
        return {
          ...state,
          advertising,
        };
      }
      return {
        ...state,
        advertising: {
          ...state.advertising,
          list: {},
        },
      };

    case SHOPEE_SET_ADVERTS_PAGINATION:
      const _previousAdvertisingData = { ...state.advertising };
      const _advertising = Object.assign({}, _previousAdvertisingData, {
        pagination: action.payload,
      });

      return {
        ...state,
        advertising: _advertising,
      };

    case SHOPEE_SET_LOADING:
      switch (currentView) {
        case "anuncios-shopee":
          const adsStateCopy1 = { ...state.advertising };
          const advertisingCase1 = Object.assign({}, adsStateCopy1, {
            isLoading: action.payload,
          });

          return {
            ...state,
            advertising: advertisingCase1,
          };

        case "vendas-shopee":
          const adsStateCopy2 = { ...state.advertising };
          const advertisingCase2 = Object.assign({}, adsStateCopy2, {
            isLoading: action.payload,
          });

          return {
            ...state,
            advertising: advertisingCase2,
          };

        default:
          return state;
      }

    case SHOPEE_CATEGORIES_TREE:
      return {
        ...state,
        categoriesTree: {
          ...state.categoriesTree,
          data: action.payload,
        },
      };

    case SET_SHOPEE_CATEGORIES_TREE_LOADING:
      return {
        ...state,
        categoriesTree: {
          ...state.categoriesTree,
          isLoading: action.payload,
        },
      };

    default:
      return state;
  }
}
