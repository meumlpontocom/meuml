import { useCallback, useContext } from "react";
import api, { headers }            from "src/services/api";
import paymentContext              from "../paymentContext";
import { setIsLoadingPayerInfo }   from "../actions/setIsLoadingPayerInfo";

/**
 * Fetch user previous saved data.
 *
 * @return {{ fetchPayerInfo: Promise }} An object with one key: 
 * - fetchPayerInfo: a promise that resolves to the response from the API call to fetch the payer data.
 */
function useFetchPayerInfo() {
  const { dispatch } = useContext(paymentContext);
  const setLoading   = useCallback((bool) => 
    dispatch(setIsLoadingPayerInfo(bool)), 
    [dispatch]
  );
  const fetchPayerInfo = async () => {
    try {
      setLoading(true);
      return await api.get("/client-data", headers());
    } catch (error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchPayerInfo };
}

export default useFetchPayerInfo;
