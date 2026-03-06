import { SET_IS_LOADING_PAYER_INFO } from "./types";

export const setIsLoadingPayerInfo = (bool) => ({
  type: SET_IS_LOADING_PAYER_INFO,
  payload: bool,
});
