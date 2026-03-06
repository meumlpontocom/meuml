/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useContext } from "react";
import Swal from "sweetalert2";
import { fetchUserInfoByNickname } from "../requests";
import SearchPublicInfoContext from "../SearchPublicInfo.context";

export const useFetchUserPublicInfo = () => {
  const { setIsLoading, setSearchResult } = useContext(SearchPublicInfoContext);

  const fetchAPI = useCallback(
    async user => {
      setIsLoading(true);
      const searchResult = await fetchUserInfoByNickname(user);
      if (searchResult?.data?.status === "success") {
        setSearchResult(searchResult.data.data);
      }
      setIsLoading(false);
    },
    [setIsLoading, setSearchResult, Swal],
  );

  return [fetchAPI];
};
