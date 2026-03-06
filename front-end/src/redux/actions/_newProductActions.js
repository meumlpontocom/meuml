export const types = {
  NEW_PRODUCT_SET_SEARCH: "NEW_PRODUCT_SET_SEARCH",
  NEW_PRODUCT_SET_IS_LOADING: "NEW_PRODUCT_SET_IS_LOADING",
  NEW_PRODUCT_SET_PAGINATION: "NEW_PRODUCT_SET_PAGINATION",
  NEW_PRODUCT_SET_DIRECTORIES: "NEW_PRODUCT_SET_DIRECTORIES",
  NEW_PRODUCT_SET_MAIN_ADVERT: "NEW_PRODUCT_SET_MAIN_ADVERT",
  NEW_PRODUCT_SET_PAGINATION_NEXT: "NEW_PRODUCT_SET_PAGINATION_NEXT",
  NEW_PRODUCT_SET_IS_IMAGES_LOADING: "NEW_PRODUCT_SET_IS_IMAGES_LOADING",
  NEW_PRODUCT_SET_CLEANUP_VIEW_STATE: "NEW_PRODUCT_SET_CLEANUP_VIEW_STATE",
  NEW_PRODUCT_SET_PAGINATION_PREVIOUS: "NEW_PRODUCT_SET_PAGINATION_PREVIOUS",
  NEW_PRODUCT_SET_TOGGLE_SELECT_IMAGE: "NEW_PRODUCT_SET_TOGGLE_SELECT_IMAGE",
  NEW_PRODUCT_SET_CURRENT_DIRECTORY_ID: "NEW_PRODUCT_SET_CURRENT_DIRECTORY_ID",
  NEW_PRODUCT_SET_RESET_IMAGE_SELECTION: "NEW_PRODUCT_SET_RESET_IMAGE_SELECTION",
  NEW_PRODUCT_SET_CURRENT_DIRECTORY_IMAGES: "NEW_PRODUCT_SET_CURRENT_DIRECTORY_IMAGES",
}

export const setSearch = search => ({
  type: types.NEW_PRODUCT_SET_SEARCH, search
});

export const setDirectories = directoryList => ({
  type: types.NEW_PRODUCT_SET_DIRECTORIES, directoryList
});

export const setSelectedDirectoryId = directoryID => ({
  type: types.NEW_PRODUCT_SET_CURRENT_DIRECTORY_ID, directoryID
});

export const setCurrentDirectoryImages = imageList => ({
  type: types.NEW_PRODUCT_SET_CURRENT_DIRECTORY_IMAGES, imageList
});

export const setIsLoading = isLoading => ({
  type: types.NEW_PRODUCT_SET_IS_LOADING, isLoading
});

export const setIsImagesLoading = isLoading => ({
  type: types.NEW_PRODUCT_SET_IS_IMAGES_LOADING, isLoading
});

export const setPagination = pagination => ({
  type: types.NEW_PRODUCT_SET_PAGINATION, pagination
});

export const setPaginationNext = () => ({
  type: types.NEW_PRODUCT_SET_PAGINATION_NEXT
});

export const setPaginationPrevious = () => ({
  type: types.NEW_PRODUCT_SET_PAGINATION_PREVIOUS
});

export const setToggleSelectImage = imageID => ({
  type: types.NEW_PRODUCT_SET_TOGGLE_SELECT_IMAGE, imageID
});

export const setCleanupViewState = () => ({
  type: types.NEW_PRODUCT_SET_CLEANUP_VIEW_STATE
});

export const setResetImageSelection = () => ({
  type: types.NEW_PRODUCT_SET_RESET_IMAGE_SELECTION
});

export const setProductMainImage = imageID => ({
  type: types.NEW_PRODUCT_SET_MAIN_ADVERT, imageID
});
