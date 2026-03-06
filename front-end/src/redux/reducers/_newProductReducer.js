import produce   from "immer";
import { types } from "../actions/_newProductActions";

const INITIAL_STATE = {
  images: {
    directories: [],
    currentDirectoryID: "",
    currentDirectoryImages: [],
    selectedImages: {},
    search: "",
    pagination: {},
    isLoading: false,
    mainImageID: null,
  },
  product: {},
  attributes: {},
  isLoading: false
};

export default function _newProductReducer(state = INITIAL_STATE, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case types.NEW_PRODUCT_SET_MAIN_ADVERT:
        if (Number(state.images.mainImageID) !== Number(action.imageID)) {
          draft.images.selectedImages[action.imageID] = true;
          draft.images.mainImageID = action.imageID;
          break;
        }
        draft.images.mainImageID = null;
        break;

      case types.NEW_PRODUCT_SET_SEARCH:
        draft.images.search = action.search;
        break;

      case types.NEW_PRODUCT_SET_DIRECTORIES:
        draft.images.directories = action.directoryList;
        break;

      case types.NEW_PRODUCT_SET_CURRENT_DIRECTORY_ID:
        draft.images.currentDirectoryID = action.directoryID;
        break;

      case types.NEW_PRODUCT_SET_CURRENT_DIRECTORY_IMAGES:
        draft.images.currentDirectoryImages = action.imageList;
        action.imageList.forEach(image => {
          if (draft.images.selectedImages[image.id] !== true) draft.images.selectedImages[image.id] = false;
        });
        break;

      case types.NEW_PRODUCT_SET_IS_LOADING:
        draft.isLoading = action.isLoading;
        break;

      case types.NEW_PRODUCT_SET_IS_IMAGES_LOADING:
        draft.images.isLoading = action.isLoading;
        break;

      case types.NEW_PRODUCT_SET_PAGINATION:
        draft.images.pagination = action.pagination;
        break;

      case types.NEW_PRODUCT_SET_PAGINATION_NEXT:
        const nxtPgPagination = state.images.pagination;
        if (nxtPgPagination.next_page > nxtPgPagination.page) {
          draft.images.pagination.page = nxtPgPagination.next_page;
        }
        break;

      case types.NEW_PRODUCT_SET_PAGINATION_PREVIOUS:
        const pvsPgPagination = state.images.pagination;
        if (pvsPgPagination.previous_page < pvsPgPagination.page) {
          draft.images.pagination.page = pvsPgPagination.previous_page;
        }
        break;

      case types.NEW_PRODUCT_SET_TOGGLE_SELECT_IMAGE:
        const isMainPic = Number(state.images.mainImageID) === Number(action.imageID);
        const isBeingUnchecked = !state.images.selectedImages[action.imageID] === false;
        if (isBeingUnchecked && isMainPic) draft.images.mainImageID = null
        draft.images.selectedImages[action.imageID] = !state.images.selectedImages[action.imageID];
        break;

      case types.NEW_PRODUCT_SET_CLEANUP_VIEW_STATE:
        return INITIAL_STATE;

      case types.NEW_PRODUCT_SET_RESET_IMAGE_SELECTION:
        return {
          ...INITIAL_STATE,
          images: {
            ...INITIAL_STATE.images,
            directories: state.images.directories,
            pagination: state.images.pagination
          }
        };

      default:
        return state;
    }
  });
}
