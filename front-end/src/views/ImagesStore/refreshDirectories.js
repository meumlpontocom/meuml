import { listDirectories }         from "./requests";
import { setAvailableDirectories } from "../../redux/actions";

export default async function refreshDirectories({ dispatch, setLoading }) {
  if (dispatch && setLoading) {
    const directoryListingResponse = await listDirectories({ setLoading });
    if (directoryListingResponse) dispatch(setAvailableDirectories(directoryListingResponse.data.data));
  }
}
