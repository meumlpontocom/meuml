import {
  REPLICATION_EDIT_SHOW_CONFIRM_BUTTON,
  REPLICATION_REPLICATE_SELF,
  REPLICATION_RESET_STORE,
  REPLICATION_SAVE_ADVERT_DIMENSION_HEIGHT,
  REPLICATION_SAVE_ADVERT_DIMENSION_LENGTH,
  REPLICATION_SAVE_ADVERT_DIMENSION_WIDTH,
  REPLICATION_SAVE_ADVERT_WEIGHT,
  REPLICATION_SAVE_AVAILABLE_CREDITS,
  REPLICATION_SAVE_CATEGORY,
  REPLICATION_SAVE_CHART,
  REPLICATION_SAVE_DIMENSION_HEIGHT,
  REPLICATION_SAVE_DIMENSION_LENGTH,
  REPLICATION_SAVE_DIMENSION_WIDTH,
  REPLICATION_SAVE_GTIN,
  REPLICATION_SAVE_SELECTED_ACCOUNTS,
  REPLICATION_SAVE_SELECTED_ADVERT,
  REPLICATION_SAVE_SHIPPING_MODES,
  REPLICATION_SAVE_SHIPPING_TERM,
  REPLICATION_SAVE_WARRANTY_TIME,
  REPLICATION_SAVE_WARRANTY_TYPE,
  REPLICATION_SAVE_WEIGHT,
  REPLICATION_SELECT_SHIPPING_MODE,
  REPLICATION_SET_FOUND_CHART,
  REPLICATION_SET_SELECTED_CATEGORY,
  REPLICATION_SET_REQUIRED_ATTRIBUTES,
  REPLICATION_TOGGLE_ALLOW_COPY_WARRANTY,
  REPLICATION_TOGGLE_COPY_SAME_ACCOUNT_ADS,
  REPLICATION_MODE,
  REPLICATION_TOGGLE_COPY_SAME_TITLE_ADS,
  REPLICATION_TOGGLE_COPY_SHIPPING_TERMS,
  REPLICATION_TOGGLE_CREATE_WITHOUT_WARRANTY,
  REPLICATION_TOGGLE_LOADING,
  REPLICATION_UPDATE_PRICE_ACTIONS,
  ACCOUNTS_OFFICIAL_STORES,
  IS_LOADING_ACCOUNTS_OFFICIAL_STORES,
  REPLICATION_OFFICIAL_STORE,
} from "./action-types";

export function saveSelectedAccounts(payload) {
  return { type: REPLICATION_SAVE_SELECTED_ACCOUNTS, payload };
}

export function setLoading() {
  return { type: REPLICATION_TOGGLE_LOADING };
}

export function saveWarrantyType(payload) {
  return { type: REPLICATION_SAVE_WARRANTY_TYPE, payload };
}

export function saveWarrantyTime(payload) {
  return {
    type: REPLICATION_SAVE_WARRANTY_TIME,
    payload,
  };
}

export function toggleCopySameTitleAds() {
  return { type: REPLICATION_TOGGLE_COPY_SAME_TITLE_ADS };
}

export function toggleCopySameAccountAds() {
  return {
    type: REPLICATION_TOGGLE_COPY_SAME_ACCOUNT_ADS,
  };
}

export function setReplicationMode(payload) {
  return {
    type: REPLICATION_MODE,
    payload,
  };
}

export function setAccountsOfficialStores(payload) {
  return {
    type: ACCOUNTS_OFFICIAL_STORES,
    payload,
  };
}

export function setIsLoadingAccountsOfficialStores(payload) {
  return {
    type: IS_LOADING_ACCOUNTS_OFFICIAL_STORES,
    payload,
  };
}

export function setSelectedOfficialStore(payload) {
  return {
    type: REPLICATION_OFFICIAL_STORE,
    payload,
  };
}

export function saveShippingTerm(payload) {
  return { type: REPLICATION_SAVE_SHIPPING_TERM, payload };
}

export function saveShippingModes(payload) {
  return {
    type: REPLICATION_SAVE_SHIPPING_MODES,
    payload,
  };
}

export function saveSelectedShippingMode(payload) {
  return { type: REPLICATION_SELECT_SHIPPING_MODE, payload };
}

export function savePriceActions(payload) {
  return {
    type: REPLICATION_UPDATE_PRICE_ACTIONS,
    payload,
  };
}

export function saveAvailableCredits(payload) {
  return {
    type: REPLICATION_SAVE_AVAILABLE_CREDITS,
    payload,
  };
}

export function toggleReplicateSelf() {
  return { type: REPLICATION_REPLICATE_SELF };
}

export function resetStore() {
  return { type: REPLICATION_RESET_STORE };
}

export function toggleAllowCopyingWarranty() {
  return { type: REPLICATION_TOGGLE_ALLOW_COPY_WARRANTY };
}

export function toggleCreateWithoutWarranty() {
  return { type: REPLICATION_TOGGLE_CREATE_WITHOUT_WARRANTY };
}

export function toggleCopyShippingTerms() {
  return { type: REPLICATION_TOGGLE_COPY_SHIPPING_TERMS };
}

export function setGtin(gtin) {
  return { type: REPLICATION_SAVE_GTIN, payload: gtin };
}

export function setDimensionHeight(height) {
  return { type: REPLICATION_SAVE_DIMENSION_HEIGHT, payload: Number(height) };
}

export function setDimensionWidth(width) {
  return { type: REPLICATION_SAVE_DIMENSION_WIDTH, payload: Number(width) };
}

export function setDimensionLength(length) {
  return { type: REPLICATION_SAVE_DIMENSION_LENGTH, payload: Number(length) };
}

export function setReplicationWeight(weight) {
  return { type: REPLICATION_SAVE_WEIGHT, payload: Number(weight) };
}

export function saveSelectedAdvert(advert) {
  return { type: REPLICATION_SAVE_SELECTED_ADVERT, payload: advert };
}

export function setSelectedCategory({ id, categoryId, shopeeRequiredAttributes }) {
  return { type: REPLICATION_SET_SELECTED_CATEGORY, payload: { id, categoryId, shopeeRequiredAttributes } };
}

export function setRequiredAttributes({ id, requiredAttributes }) {
  return { type: REPLICATION_SET_REQUIRED_ATTRIBUTES, payload: { id, requiredAttributes } };
}

export function setAdvertDimensionHeight({ id, height }) {
  return { type: REPLICATION_SAVE_ADVERT_DIMENSION_HEIGHT, payload: { id, height } };
}

export function setAdvertDimensionLength({ id, length }) {
  return { type: REPLICATION_SAVE_ADVERT_DIMENSION_LENGTH, payload: { id, length } };
}

export function setAdvertDimensionWidth({ id, width }) {
  return { type: REPLICATION_SAVE_ADVERT_DIMENSION_WIDTH, payload: { id, width } };
}

export function setAdvertWeight({ id, weight }) {
  return { type: REPLICATION_SAVE_ADVERT_WEIGHT, payload: { id, weight } };
}

export function setSelectedGlobalCategory(categoryId) {
  return { type: REPLICATION_SAVE_CATEGORY, payload: categoryId };
}

export function saveSelectedChart(selected) {
  return { type: REPLICATION_SAVE_CHART, payload: selected };
}

export function setFoundChart(found) {
  return { type: REPLICATION_SET_FOUND_CHART, payload: found };
}

export function setShowEditConfirmButton(show) {
  return { type: REPLICATION_EDIT_SHOW_CONFIRM_BUTTON, payload: show };
}

export function checkIfAdvertIsValid(dimension, weight, categoryId) {
  const isValid = !!(
    dimension?.height &&
    dimension?.height > 0 &&
    dimension?.width &&
    dimension?.width > 0 &&
    dimension?.length &&
    dimension?.length > 0 &&
    weight &&
    weight > 0 &&
    categoryId
  );

  return isValid;
}
