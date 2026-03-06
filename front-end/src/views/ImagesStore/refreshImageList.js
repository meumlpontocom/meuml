import store                                       from "../../redux/store";
import { listFiles }                               from "./requests";
import { setAvailableImages, setFolderPagination } from "../../redux/actions";

export default async function refreshImageList(dispatch, setLoading, page) {
  const state = store.getState();
  const parentId = state.imageStorage.files.folders.filter(folder => folder.isSelected)[0]?.id;
  const config = { setLoading, parentId, page: page || state.imageStorage.currentFolderPagination.page }
  if (config.parentId) {
    const getImagesResponse = await listFiles({ ...config });
    if (getImagesResponse) {
      dispatch(setAvailableImages(getImagesResponse.data.data));
      dispatch(setFolderPagination(getImagesResponse.data.meta));
    }
  }
}
