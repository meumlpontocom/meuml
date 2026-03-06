import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../../redux/actions/_replicationActions";
import replicateAdvert from "./replicateAdverts";

const useReplication = () => {
  const dispatch = useDispatch();
  const toggleLoading = useCallback(() => dispatch(setLoading()), [dispatch]);

  const { selectedAdverts, selectedAccounts, query, searchType, weight, dimension, categoryId } = useSelector(
    state => state.advertsReplication,
  );

  const requestCommonParams = useMemo(() => {
    return {
      toggleLoading,
      selectedAccounts,
      dispatch,
    };
  }, [dispatch, selectedAccounts, toggleLoading]);

  const submitRequest = useCallback(async () => {
    return await replicateAdvert({
      ...requestCommonParams,
      confirmed: 0,
      selectedAdverts,
      query,
      searchType,
      weight,
      dimension,
      categoryId,
    });
  }, [dimension, query, requestCommonParams, searchType, selectedAdverts, weight, categoryId]);

  return { submitRequest };
};

export default useReplication;
