import * as types from "./action-types";

// Accounts
export function saveAccounts(data) {
  return { type: types.SAVE_USER_ACCOUNTS, payload: { ...data } };
}

export function saveSelectedAccounts(selectedAccountArray) {
  return { type: types.SAVE_SELECTED_ACCOUNTS, payload: selectedAccountArray };
}

export function setAccountsIsLoading(boolean) {
  return {
    type: types.ACCOUNTS_SET_IS_LOADING,
    payload: boolean,
  };
}

// Create Advert
export function updateAdvertSpecs({ param, value }) {
  return { type: types.UPDATE_SPECS, payload: { param, value } };
}

export function saveCategories({ categories }) {
  return { type: types.SAVE_CATEGORY_LIST, payload: categories };
}

export function setPredictedCategory({ category }) {
  return { type: types.SET_PREDICTED_CATEGORY, payload: category };
}

export function setPredictedAsMainCategory() {
  return { type: types.CONFIRM_PREDICTED_CATEGORY };
}

export function setPathAsDefinedCategory() {
  return { type: types.CONFIRM_PATH_AS_CATEGORY };
}

export function saveFormData({ param, value }) {
  return { type: types.SAVE_FORM_DATA, payload: { param, value } };
}

export function deleteVariation(index) {
  return { type: types.CREATE_ADVERT_DELETE_VARIATION, payload: index };
}

export function saveAdvertDescription({ id, name, value }) {
  return { type: types.CREATE_ADVERT_SAVE_DESCRIPTION, payload: { id, name, value } };
}

export function saveCatalogOptions(options) {
  return { type: types.CREATE_ADVERT_CATALOG_OPTIONS, payload: options };
}

// Adverts Position Grid
export function saveAdvertsPositionGrid(positionGrid) {
  return { type: types.SAVE_ADS_POSITION_GRID, payload: positionGrid };
}

export function saveAdvertsPositionGridPagination(data) {
  return { type: types.SAVE_ADS_POSITION_GRID_PAGINATION, payload: { ...data } };
}

export function clearAdvertsPositionGrid() {
  return { type: types.CLEAR_ADS_POSITION_GRID };
}

export function saveAdvertsPositionGridUrl(url) {
  return { type: types.SAVE_ADS_POSITION_GRID_URL, payload: url };
}

export function saveFilterString(filterString) {
  return { type: types.SAVE_FILTER_STRING, payload: filterString };
}

// Adverts
export function setDisplayConfig({ payload }) {
  return { type: types.SET_DISPLAY_COMPONENTS, payload };
}

export function saveAdverts(data) {
  return { type: types.SAVE_ADVERTS, payload: { ...data } };
}

export function saveReplicationSelectedAdvert(advert) {
  return { type: types.REPLICATION_SELECT_ADVERT, payload: advert };
}

export function saveAdvertsPagination(data) {
  return { type: types.SAVE_ADVERTS_PAGINATION, payload: { ...data } };
}

export function filterAdverts(data) {
  return { type: types.FILTER_ADVERTS, payload: { ...data } };
}

export function checkAdvert({ id, checked, status, title, price, advertData, shopeeRequiredAttributes }) {
  return {
    type: types.CHECK_ADVERT,
    payload: { id, checked, status, title, price, advertData, shopeeRequiredAttributes },
  };
}

export function checkAllAdverts({ page, adverts }) {
  return { type: types.CHECK_ALL_ADS, payload: { page, adverts } };
}

export function uncheckAllAdverts() {
  return { type: types.UNCHECK_ALL_ADS };
}

export function checkAllAdvertsFromPage({ page, adverts }) {
  return { type: types.CHECK_ALL_ADS_FROM_PAGE, payload: { page, adverts } };
}

export function addAdvertToSelectionState(data) {
  return { type: types.ADD_AD_TO_SELECTION_STATE, payload: { ...data } };
}

export function advertsURL(url) {
  return { type: types.ADVERTS_URL, url };
}

export function clearAdvertsState() {
  return { type: types.CLEAR_ADS_STATE };
}

export function clearFilterState() {
  return { type: types.CLEAR_FILTER_STATE };
}

export function clearURLState() {
  return { type: types.CLEAR_URL_STATE };
}

export function changeAdvertCatalog(data) {
  return { type: types.CHANGE_ADVERT_CATALOG, payload: data };
}

// Questions
export function saveQuestionsToBeAnswered(questions) {
  return { type: types.SAVE_QUESTIONS, payload: questions };
}

export function clearAnsweredQuestion(data) {
  return { type: types.CLEAR_ANSWERED_QUESTIONS, payload: data };
}

export function saveAnsweredQuestionMsg(msg) {
  return { type: types.SAVE_ANSWERED_QUESTION_MSG, payload: msg };
}

// Discount
export default function discountAction({ label, value }) {
  return { type: types.DISCOUNT_ACTION, payload: { label, value } };
}

// Form Popup
export function saveFormPopupData({ label, value }) {
  return { type: types.SAVE_FORM_POPUP_DATA, payload: { label, value } };
}

export function saveFormPopupUrl(url) {
  return { type: types.SAVE_FORM_POPUP_URL, payload: { url } };
}

export function fetchHeaderFooterFormPopUp() {
  return { type: types.FETCH_HEADER_FOOTER_API_FORM_POPUP };
}

export function fetchReplaceTextFormPopup() {
  return { type: types.FETCH_REPLACE_TEXT_API_FORM_POPUP };
}

export function fetchAlterTextFormPopup() {
  return { type: types.FETCH_ALTER_TEXT_API_FORM_POPUP };
}

export function fetchAlterPriceFormPopup() {
  return { type: types.FETCH_ALTER_PRICE_API_FORM_POPUP };
}

export function fetchAlterManufacturingTime() {
  return { type: types.FETCH_ALTER_MANUFACTURING_TIME };
}

// Flex Shippin
export function fetchActivateFlexShipping() {
  return { type: types.FLEX_SHIPPING_ACTIVATE };
}

export function fetchDeactivateFlexShipping() {
  return { type: types.FLEX_SHIPPING_DEACTIVATE };
}

export function saveFlexShippingCoverageZone(data) {
  return { type: types.FLEX_SHIPPING_CONFIG_COVERAGEZONE, payload: { ...data } };
}

export function saveFlexConfig(config) {
  return { type: types.FLEX_SHIPPING_CONFIG, payload: { ...config } };
}

// Payment
export function requestPayment(data) {
  return { type: "payment/REQUEST_PAYMENT", payload: { data } };
}

// Process
export function saveProcessList(data) {
  return { type: types.SAVE_PROCESS_LIST, payload: [...data] };
}

export function clearProcessList() {
  return { type: types.CLEAR_PROCESS_LIST };
}

export function saveProcessDetails({ processId, details }) {
  return { type: types.SAVE_PROCESS_DETAILS, payload: { processId, details } };
}

// Images Storage
export function saveStorageFiles(files) {
  return { type: types.SAVE_AVAILABLE_FILES, files };
}

export function setIsImageStorageLoading(boolean) {
  return { type: types.SET_IMAGE_STORAGE_LOADING, isLoading: boolean };
}

export function setIsFolderSelected(folderId, isSelected) {
  return { type: types.SET_IMAGE_STORAGE_SELECT_FOLDER, folderId, isSelected };
}

export function setUploadFiles(uploadList) {
  return { type: types.SET_IMAGE_TO_UPLOAD, uploadList };
}

export function setSearchString(searchString) {
  return { type: types.SET_IMAGE_SEARCH, searchString };
}

export function setSearchFileResult(fileList) {
  return { type: types.SET_IMAGE_SET_SEARCH_RESULT, fileList };
}

export function setFolderPagination(meta) {
  return { type: types.SET_IMAGE_SAVE_PAGINATION, meta };
}

export function setAvailableDirectories(directories) {
  return { type: types.SET_IMAGE_AVAILABLE_DIRECTORIES, directories };
}

export function setAvailableImages(images) {
  return { type: types.SET_IMAGE_AVAILABLE_IMAGES, images };
}

export function setImageStorePictureIsSelected(imageId, checked) {
  return { type: types.SET_IMAGE_STORAGE_SELECTED_IMAGE, imageId, checked };
}

export function setImageStorePaginationCleanup() {
  return { type: types.SET_IMAGE_RESET_PAGINATION_STATE };
}

export function setImageStorageSelectAllImages() {
  return { type: types.SET_IMAGE_SELECT_ALL_PICTURES };
}

export function setImageStorageClearImageSelection() {
  return { type: types.SET_IMAGE_CLEAR_PICTURES_SELECTION };
}

export function setAdvertSelectedCategory({ external_id, selectedCategoryId }) {
  return { type: types.SET_SELECTED_CATEGORY, payload: { external_id, selectedCategoryId } };
}
