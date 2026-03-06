import {
  SALES_TOGGLE_LOADING,
  SALES_TOGGLE_IS_CARD_OPEN,
  SALES_COLLAPSE_ALL_CARDS,
  SALES_SAVE_FILTER_STRING,
  SALES_SAVE_SELECTED_ACCOUNTS,
  SALES_RESET_FILTER_STRING,
  SALES_SAVE_SALES,
  SALES_SAVE_META,
  SALES_SAVE_STATUS_FILTER,
  SALES_SET_SELECTED_SALE,
  SALES_SET_SELECT_ALL,
  SALES_CLEAN_SALES_STATE,
  SALES_FETCH_MSHOPS,
} from "./action-types";

export function setShouldFetchMShopsData(boolean) {
  return { type: SALES_FETCH_MSHOPS, payload: boolean };
}

export function setSelectedAllSales(boolean) {
  return { type: SALES_SET_SELECT_ALL, payload: boolean };
}

export function cleanSalesState() {
  return { type: SALES_CLEAN_SALES_STATE };
}

export function setSelectedSale({ id, checked }) {
  return { type: SALES_SET_SELECTED_SALE, payload: { id, checked } };
}

export function saveStatusFilter(status) {
  return { type: SALES_SAVE_STATUS_FILTER, payload: status };
}

export function toggleLoading() {
  return { type: SALES_TOGGLE_LOADING };
}

export function toggleIsCardOpen(key) {
  return { type: SALES_TOGGLE_IS_CARD_OPEN, payload: key };
}

export function collapseAllCards(boolean) {
  return { type: SALES_COLLAPSE_ALL_CARDS, payload: boolean };
}

export function saveFilterString(inputValue) {
  return { type: SALES_SAVE_FILTER_STRING, payload: inputValue };
}

export function saveSelectedAccounts(selectedAccounts) {
  return { type: SALES_SAVE_SELECTED_ACCOUNTS, payload: selectedAccounts };
}

export function resetFilterString() {
  return { type: SALES_RESET_FILTER_STRING };
}

export function saveSales(sales) {
  return { type: SALES_SAVE_SALES, payload: sales };
}

export function saveMeta(meta) {
  return { type: SALES_SAVE_META, payload: meta };
}
