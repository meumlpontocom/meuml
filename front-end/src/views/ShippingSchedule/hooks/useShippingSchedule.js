import { useState, useCallback } from "react";
import api, { headers }          from "src/services/api";
import shippingScheduleTypes     from "../shippingScheduleTypes";

const useShippingSchedule = () => {
  const [shippingSchedules, setShippingSchedules] = useState({
    [shippingScheduleTypes[0].id]: { error: null, isLoading: false },
    [shippingScheduleTypes[1].id]: { error: null, isLoading: false },
    [shippingScheduleTypes[2].id]: { error: null, isLoading: false },
    [shippingScheduleTypes[3].id]: { error: null, isLoading: false },
  });

  const throwNewError = ({ errorMessage }) => {
    const error = new Error();
    const error_custom = `${error}: ${errorMessage}`;
    throw error_custom;
  };

  const validateAccountIdParam = useCallback(accountId => {
    return typeof accountId !== "number" &&
      throwNewError({ errorMessage: "Expecting 'accountId' to be of type 'Number'" });
  }, []);

  const validateShippingTypeParam = useCallback(shippingType => {
    return typeof shippingType !== "string" &&
      throwNewError({ errorMessage: "Expecting 'shippingType' to be of type 'Number'" });
  }, []);

  const setLoadingShippingType = ({ shippingType, isLoading }) => {
    return setShippingSchedules(beforeChange => ({
      ...beforeChange,
      [shippingType]: { isLoading },
    }));
  };

  const isReFetching = useCallback(shippingType => !!shippingSchedules[shippingType].schedule?.wednesday, [shippingSchedules]);

  const fetchAPI = useCallback(async ({ accountId, shippingType }) => {
    setLoadingShippingType({ shippingType, isLoading: true });
    const url = `/shipping/schedule?account_id=${accountId}&logistic_type=${shippingType}`;
    return await api.get(url, headers());
  }, []);

  const handleShippingSchedule = useCallback(
    async ({ accountId, shippingType = shippingScheduleTypes[0] }) => {
      try {
        validateAccountIdParam(accountId);
        validateShippingTypeParam(shippingType);
        if (!isReFetching(shippingType)) {
          const response = await fetchAPI({ accountId, shippingType });
          setShippingSchedules(state => ({
            ...state,
            [shippingType]: response.data.data,
          }));
        }
      } catch (error) {
        setShippingSchedules(beforeChange => ({
          ...beforeChange,
          [shippingType]: { error },
        }));
      }
    },
    [fetchAPI, isReFetching, validateAccountIdParam, validateShippingTypeParam],
  );

  return [shippingSchedules, handleShippingSchedule];
};

export default useShippingSchedule;
