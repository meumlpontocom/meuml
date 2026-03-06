import { useEffect, useCallback } from "react";
import { useSelector }            from "react-redux";
import formatMoney                from "src/helpers/formatMoney";
import { setPaymentCheckout }     from "../actions/setPaymentCheckout";

/**
 * Gets the checkout data from global reducer state, integrated
 * in the 'buy-credits' and 'subscribe' views, and preserve it in the localStorage
 * and view's reducer's state.
 *
 * @param {Object} state - the payments' reducer's state
 * @param {Function} dispatch - the payments' reducer's dispatch
 * @return {Object} - the return value is the paymentReducer.state.payments pure object
 */
function usePaymentCheckout(state, dispatch) {
  const globalReduxPaymentState  = useSelector((state) => state.payments);
  const localStoragePaymentState = JSON.parse(
    localStorage.getItem("@MeuML-Checkout")
  );

  const createFormattedTotal = useCallback((checkoutData) => {
    return { totalFormatted: formatMoney(checkoutData.total), ...checkoutData };
  }, []);

  const setPayments = useCallback(
    (data) => dispatch(setPaymentCheckout(data)),
    [dispatch]
  );

  useEffect(() => {
    if (state.payments.internal_order_id === null) {
      if (localStoragePaymentState) {
        setPayments(createFormattedTotal(localStoragePaymentState));
      } else if (globalReduxPaymentState && !!globalReduxPaymentState.total) {
        setPayments(createFormattedTotal(globalReduxPaymentState));
        localStorage.setItem(
          "@MeuML-Checkout",
          JSON.stringify(globalReduxPaymentState)
        );
      }
    }
  }, [
    createFormattedTotal,
    globalReduxPaymentState,
    localStoragePaymentState,
    setPayments,
    state.payments,
  ]);

  return state.payments;
}

export default usePaymentCheckout;
