// import _saveAccountsReducer from './_saveAccountsReducer';
import _geoDataReducer from "./_geoDataReducer";
import _dataDisplayConfigReducer from "./_dataDisplayConfigReducer";
import _advertsPaginationReducer from "./_advertsPaginationReducer";
import _advertsFilterReducer from "./_advertsFilterReducer";
import _advertsUrlReducer from "./_advertsUrlReducer";
import _advertsReducer from "./_advertsReducer";
import _advertsSelectionReducer from "./_advertsSelectionReducer";
import _changeCatalogReducer from "./_advertsChangeCatalogReducer";
import _adsPositionGrid from "./_adsPositionGrid";
import _accountsReducer from "./_accountsReducer";
import _questionsReducer from "./_questionsReducer";
import { combineReducers } from "redux";
import _discountReducer from "./_discountReducer";
import _formPopupReducer from "./_formPopupReducer";
import payments from "./_payment";
import _createAdvertReducer from "./_createAdvertReducer";
import _flexShippingConfig from "./_flexShippingConfig";
import _processReducer from "./_processReducer";
import _advertReplicationReducer from "./_advertReplicationReducer";
import _catalogReducer from "./_catalogReducer";
import _mshopsReducer from "./_mshopsReducer";
import salesReducer from "./_salesReducer";
import _dashboardReducer from "./_dashboardReducer";
import _moderationReducer from "./_moderationReducer";
import _highQualityAdvertReducer from "./_highQualityAdvertReducer";
import _qualityDetailsReducer from "./_qualityDetailsReducer";
import _tagsReducer from "./_tagsReducer";
import _editAdvertReducer from "./_editAdvertReducer";
import _shopeeReducer from "./_shopeeReducer";
import _coreuiReducer from "./_coreuiReducer";
import _imageStorageReducer from "./_imageStorageReducer";
import _newProductReducer from "./_newProductReducer";
import _mlCategoriesReducer from "./_mlCategoriesReducer";

const Reducers = combineReducers({
  newProduct: _newProductReducer,
  imageStorage: _imageStorageReducer,
  geo: _geoDataReducer,
  coreui: _coreuiReducer,
  shopee: _shopeeReducer,
  editAdvert: _editAdvertReducer,
  accounts: _accountsReducer,
  adverts: _advertsReducer,
  advertCreation: _createAdvertReducer,
  advertsReplication: _advertReplicationReducer,
  advertsFilters: _advertsFilterReducer,
  advertsURL: _advertsUrlReducer,
  advertsMeta: _advertsPaginationReducer,
  advertsPositionGrid: _adsPositionGrid,
  changeAdvertCatalog: _changeCatalogReducer,
  components: _dataDisplayConfigReducer,
  catalog: _catalogReducer,
  mshops: _mshopsReducer,
  dashboard: _dashboardReducer,
  discount: _discountReducer,
  flexShippingConfig: _flexShippingConfig,
  formPopup: _formPopupReducer,
  highQualityAdvert: _highQualityAdvertReducer,
  moderations: _moderationReducer,
  payments: payments,
  process: _processReducer,
  questions: _questionsReducer,
  qualityDetails: _qualityDetailsReducer,
  sales: salesReducer,
  selectedAdverts: _advertsSelectionReducer,
  tags: _tagsReducer,
  mlCategories: _mlCategoriesReducer,
});

export default Reducers;
