import {
  CATALOG_SELECT_ACCOUNT,
  CATALOG_SAVE_ADVERTISING,
  CATALOG_TOGGLE_LOADING,
  CATALOG_SAVE_ADVERTS_META,
  CATALOG_CLEAR_ADVERTS_DATA,
  CATALOG_FILTER_ADVERTS,
  CATALOG_SELECT_ADVERTISING,
  CATALOG_SELECT_ALL_ADS,
  CATALOG_SELECT_ALL_ADS_FROM_PAGE,
  CATALOG_SET_PRICE_TO_WIN_FILTERS,
  CATALOG_SET_TAGS_FILTER
} from "../actions/action-types";

const INITIAL_STATE = {
  selectedAccounts: [],
  advertising: {},
  loading: false,
  tagsFilter: null,
  catalogFilter: null,
  priceToWinFilter: null,
  pagesSelected: [],
  allAdvertisingSelected: false,
  unselectedAdvertsException: [],
  meta: {
    first_page: 1,
    last_page: 1,
    limit: 50,
    next_page: 1,
    offset: 0,
    page: 1,
    pages: 1,
    previous_page: 0,
    total: 0,
  },
};

export default function _catalogReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CATALOG_SELECT_ALL_ADS:
      return {
        ...state,
        pagesSelected: [],
        allAdvertisingSelected: !state.allAdvertisingSelected,
      };

    case CATALOG_SELECT_ALL_ADS_FROM_PAGE:
      const { advertising } = state;
      const ads = {};

      const currentPageIsSelected = state.pagesSelected.find(
        (page) => page === state.meta.page
      );

      for (const id in advertising) {
        ads[id] = {
          ...advertising[id],
          selected: !currentPageIsSelected ? true : false,
        };
      }

      return {
        ...state,
        advertising: { ...ads },
        pagesSelected: !currentPageIsSelected
          ? [...state.pagesSelected, state.meta.page]
          : [...state.pagesSelected.filter((page) => page !== state.meta.page)],
      };

    case CATALOG_SELECT_ADVERTISING:
      if (!action.payload.checked && state.allAdvertisingSelected) {
        return {
          ...state,
          unselectedAdvertsException: [
            ...state.unselectedAdvertsException,
            action.payload.id,
          ],
        };
      } else if (
        state.unselectedAdvertsException.find(
          (adId) => adId === action.payload.id
        )
      ) {
        return {
          ...state,
          advertising: {
            ...state.advertising,
            [action.payload.id]: {
              ...state.advertising[action.payload.id],
              selected: false,
            },
          },
          unselectedAdvertsException: [
            ...state.unselectedAdvertsException.filter(
              (adId) => adId !== action.payload.id
            ),
          ],
        };
      }

      return {
        ...state,
        advertising: {
          ...state.advertising,
          [action.payload.id]: {
            ...state.advertising[action.payload.id],
            selected: action.payload.checked,
          },
        },
        unselectedAdvertsException: [
          ...state.unselectedAdvertsException.filter(
            (adId) => adId !== action.payload.id
          ),
        ],
      };

    case CATALOG_CLEAR_ADVERTS_DATA:
      return {
        ...state,
        advertising: {},
      };

    case CATALOG_SELECT_ACCOUNT:
      return {
        ...state,
        selectedAccounts: action.payload,
      };

    case CATALOG_SAVE_ADVERTISING:
      let advertsToSave = {};
      action.payload.forEach((advert) => {
        advertsToSave[advert.external_id] = { ...advert, selected: false };
      });
      return {
        ...state,
        advertising: advertsToSave,
      };

    case CATALOG_TOGGLE_LOADING:
      return {
        ...state,
        loading: !state.loading,
      };

    case CATALOG_SAVE_ADVERTS_META:
      return {
        ...state,
        meta: action.payload,
      };


    case CATALOG_FILTER_ADVERTS:
      return {
        ...state,
        catalogFilter: action.payload,
      };

    case CATALOG_SET_TAGS_FILTER:
      return {
        ...state,
        tagsFilter: action.payload,
      }

    case CATALOG_SET_PRICE_TO_WIN_FILTERS:
      return {
        ...state,
        priceToWinFilter: action.payload,
      }

    default:
      return state;
  }
}
