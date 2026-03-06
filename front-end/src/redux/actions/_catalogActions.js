import {
  CATALOG_SELECT_ACCOUNT,
  CATALOG_SAVE_ADVERTISING,
  CATALOG_TOGGLE_LOADING,
  CATALOG_SAVE_ADVERTS_META,
  CATALOG_CLEAR_ADVERTS_DATA,
  CATALOG_FILTER_ADVERTS,
  CATALOG_SELECT_ADVERTISING,
  CATALOG_SELECT_ALL_ADS_FROM_PAGE,
  CATALOG_SELECT_ALL_ADS,
  CATALOG_SET_PRICE_TO_WIN_FILTERS,
  CATALOG_SET_TAGS_FILTER
} from "./action-types";

export function selectAccount(value) {
  return { type: CATALOG_SELECT_ACCOUNT, payload: value };
}

export function saveAdvertising(advertising) {
  return { type: CATALOG_SAVE_ADVERTISING, payload: advertising };
}

export function toggleLoading() {
  return { type: CATALOG_TOGGLE_LOADING };
}

export function saveAdvertsMeta(meta) {
  return { type: CATALOG_SAVE_ADVERTS_META, payload: meta };
}

export function clearAdvertsState() {
  return { type: CATALOG_CLEAR_ADVERTS_DATA };
}

export function selectAdvert({ id, checked }) {
  return { type: CATALOG_SELECT_ADVERTISING, payload: { id, checked } };
}

export function toggleSelectAllAds() {
  return { type: CATALOG_SELECT_ALL_ADS };
}

export function toggleSelectAllAdsFromPage() {
  return { type: CATALOG_SELECT_ALL_ADS_FROM_PAGE };
}


export function saveAdvertsFilter(filter) {
  return { type: CATALOG_FILTER_ADVERTS, payload: filter };
}

export function setPriceToWinFilter(filter) {
  return { type: CATALOG_SET_PRICE_TO_WIN_FILTERS, payload: filter };
}

export function setTagsFilter(filter) {
  return { type: CATALOG_SET_TAGS_FILTER, payload: filter };
}
