import {
    MSHOPS_SAVE_PRODUCT,
    MSHOPS_SAVE_PRODUCT_META,
    MSHOPS_TOGGLE_LOADING,
    MSHOPS_CLEAR_PRODUCT_DATA,
    MSHOPS_SELECT_ALL_ADS,
    MSHOPS_SELECT_ALL_ADS_FROM_PAGE,
    MSHOPS_SELECT_ACCOUNT,
    MSHOPS_SELECT_PRODUCT,
    MSHOPS_TOGGLE_LOADING_STATUS,
    MSHOPS_TOGGLE_LOADING_SHIPPING
  } from "./action-types";
  
export function saveProduct(products) {
    return { type: MSHOPS_SAVE_PRODUCT, payload: products };
}

export function saveProductMeta(meta) {
    return { type: MSHOPS_SAVE_PRODUCT_META, payload: meta };
}

export function toggleLoading() {
    return { type: MSHOPS_TOGGLE_LOADING };
}

export function toggleLoadingStatus() {
    return { type: MSHOPS_TOGGLE_LOADING_STATUS };
}

export function toggleLoadingShipping() {
    return { type: MSHOPS_TOGGLE_LOADING_SHIPPING };
}

export function clearProductsState() {
    return { type: MSHOPS_CLEAR_PRODUCT_DATA };
}

export function toggleSelectAllAds() {
    return { type: MSHOPS_SELECT_ALL_ADS };
}
  
export function toggleSelectAllAdsFromPage() {
    return { type: MSHOPS_SELECT_ALL_ADS_FROM_PAGE };
}

export function selectAccount(value) {
    return { type: MSHOPS_SELECT_ACCOUNT, payload: value };
}

export function selectProduct({ id, checked }) {
    return { type: MSHOPS_SELECT_PRODUCT, payload: { id, checked } };
}