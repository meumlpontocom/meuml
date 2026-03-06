import {
  SHOPEE_SET_ADVERTS,
  SHOPEE_SET_ADVERTS_PAGINATION,
  SHOPEE_SET_LOADING,
  SHOPEE_SET_SALES_LIST,
  SHOPEE_SET_SELECTED_ACCOUNT_LIST,
  SHOPEE_SET_SALES_FILTER_STRING,
  SHOPEE_SET_ADS_FILTER_STRING,
  SHOPEE_SET_SELECTED_ADVERTS,
  SHOPEE_SET_SELECTED_ALL_ADS,
  SHOPEE_SET_REPLICATION_COPY_SAME,
  SHOPEE_RESET_STATES,
  SHOPEE_SET_STOCK_FILTER,
  SHOPEE_CATEGORIES_TREE,
  SET_SHOPEE_CATEGORIES_TREE_LOADING,
} from "./action-types";

// ADVERTS
export function setStockFilter(selected) {
  return { type: SHOPEE_SET_STOCK_FILTER, selectedFilter: selected };
}

export function resetShopeeStates() {
  return { type: SHOPEE_RESET_STATES };
}

export function setAdverts(adverts) {
  return { type: SHOPEE_SET_ADVERTS, payload: adverts };
}

export function setAdvertsPagination(pagination) {
  return { type: SHOPEE_SET_ADVERTS_PAGINATION, payload: pagination };
}

export function setAdvertsFilterString({ filter, value }) {
  return { type: SHOPEE_SET_ADS_FILTER_STRING, payload: { filter, value } };
}

export function setSelectedAdvertising(selected) {
  return {
    type: SHOPEE_SET_SELECTED_ADVERTS,
    payload: selected,
  };
}

export function setSelectAllAdverts(areSelected) {
  return { type: SHOPEE_SET_SELECTED_ALL_ADS, payload: areSelected };
}
// REPLICATION
export function setToggleCopyDuplicateAds({ label, value }) {
  return { type: SHOPEE_SET_REPLICATION_COPY_SAME, payload: { label, value } };
}

// SALES
export function setSalesList(salesList) {
  return { type: SHOPEE_SET_SALES_LIST, payload: salesList };
}

export function setSalesFilterString(filterString) {
  return { type: SHOPEE_SET_SALES_FILTER_STRING, payload: filterString };
}
// OTHER
export function setLoading(boolean) {
  return { type: SHOPEE_SET_LOADING, payload: boolean };
}

export function setSelectedAccountList(selectedAccountList) {
  return {
    type: SHOPEE_SET_SELECTED_ACCOUNT_LIST,
    payload: selectedAccountList,
  };
}

export function setShopeeCategoriesTree(shopeeCategoriesTree) {
  return { type: SHOPEE_CATEGORIES_TREE, payload: shopeeCategoriesTree };
}

export function setShopeeCategoriesTreeLoading(isLoading) {
  return { type: SET_SHOPEE_CATEGORIES_TREE_LOADING, payload: isLoading };
}
