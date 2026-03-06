import produce from "immer";
import {
  SET_IMAGE_SEARCH,
  SET_IMAGE_TO_UPLOAD,
  SAVE_AVAILABLE_FILES,
  SET_IMAGE_SAVE_PAGINATION,
  SET_IMAGE_STORAGE_LOADING,
  SET_IMAGE_AVAILABLE_IMAGES,
  SET_IMAGE_SET_SEARCH_RESULT,
  SET_IMAGE_STORAGE_SELECT_FOLDER,
  SET_IMAGE_AVAILABLE_DIRECTORIES,
  SET_IMAGE_STORAGE_SELECTED_IMAGE,
  SET_IMAGE_RESET_PAGINATION_STATE,
  SET_IMAGE_SELECT_ALL_PICTURES,
  SET_IMAGE_CLEAR_PICTURES_SELECTION,
}              from "../actions/action-types";

const INITIAL_STATE = {
  isLoading: false,
  files: {
    images: [],
    folders: [],
    uploadList: [],
    selectedPictures: [],
    selectAllPictures: 0,
  },
  search: "",
  searchResult: [],
  currentFolderPagination: {
    first_page: 0,
    last_page: 0,
    limit: 0,
    next_page: 0,
    offset: 0,
    page: 1,
    pages: 1,
    previous_page: 0,
    total: 0,
  },
};

export default function _imageStorageReducer(state = INITIAL_STATE, action) {
  const handleFiles = isDirectory => action.files
    .filter(file => !!file.is_directory === !!isDirectory)
    .map(file => ({ ...file, isSelected: false }));

  return produce(state, (draft) => {
    switch (action.type) {
      case SET_IMAGE_STORAGE_SELECTED_IMAGE:
        if (!state.files.selectAllPictures) {
          if (action.checked) draft.files.selectedPictures.push(action.imageId);
          else draft.files.selectedPictures = state.files.selectedPictures.filter(pictureId => pictureId !== action.imageId);
        } else {
          if (!action.checked) draft.files.selectedPictures.push(action.imageId);
          else draft.files.selectedPictures = state.files.selectedPictures.filter(pictureId => pictureId !== action.imageId);
        }
        break;

      case SET_IMAGE_AVAILABLE_IMAGES:
        draft.files.images = action.images;
        break;

      case SET_IMAGE_AVAILABLE_DIRECTORIES:
        draft.files.folders = action.directories;
        break;

      case SET_IMAGE_SAVE_PAGINATION:
        draft.currentFolderPagination = action.meta;
        break;

      case SAVE_AVAILABLE_FILES:
        const images = handleFiles(0);
        draft.files.images = images;
        const folders = handleFiles(1);
        draft.files.folders = folders;
        break;

      case SET_IMAGE_STORAGE_LOADING:
        draft.isLoading = action.isLoading;
        break;

      case SET_IMAGE_STORAGE_SELECT_FOLDER:
        const isSelected = action.isSelected;
        draft.files.folders = state.files.folders
          .map(folder => folder.id === action.folderId ? { ...folder, isSelected } : { ...folder, isSelected: false });
        break;

      case SET_IMAGE_TO_UPLOAD:
        draft.files.uploadList = action.uploadList;
        break;

      case SET_IMAGE_SEARCH:
        draft.search = action.searchString;
        if (action.searchString === "") draft.searchResult = [];
        break;

      case SET_IMAGE_SET_SEARCH_RESULT:
        draft.searchResult = action.fileList;
        break;

      case SET_IMAGE_RESET_PAGINATION_STATE:
        draft.currentFolderPagination = INITIAL_STATE.currentFolderPagination;
        break;

      case SET_IMAGE_SELECT_ALL_PICTURES:
        draft.files.selectAllPictures = 1;
        draft.files.selectedPictures = [];
        break;

      case SET_IMAGE_CLEAR_PICTURES_SELECTION:
        draft.files.selectAllPictures = 0;
        draft.files.selectedPictures = [];
        break;

      default:
        return draft;
    }
  });
}
