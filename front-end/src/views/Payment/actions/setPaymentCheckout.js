import { SET_PAYMENT_CHECKOUT } from "./types";

export const setPaymentCheckout = (checkoutData) => ({
  type: SET_PAYMENT_CHECKOUT,
  payload: checkoutData,
});
