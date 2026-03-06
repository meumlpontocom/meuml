import { useContext } from "react";
import paymentContext from "../paymentContext";
import {
  setShowUserDataFormModal as setShowUserForm,
  setShowDisclaimerModal   as setShowDisclaimer,
  setShowPixModal          as setShowPix,
  setShowPaymentReviewModal,
} from "../actions/setShowModal";

/**
 * Returns an object with properties and functions for controlling (hiding and displaying) modals.
 *
 * @return {object} An object with properties and functions for controlling modals.
 */
function useModalController() {
  const { state, dispatch } = useContext(paymentContext);
  return {
    showUserDataFormModal    : state.showUserDataFormModal,
    setShowUserDataFormModal : bool => dispatch(setShowUserForm(bool)),
    showDisclaimerModal      : state.showDisclaimerModal,
    setShowDisclaimerModal   : bool => dispatch(setShowDisclaimer(bool)),
    showPaymentReviewModal   : state.showPaymentReviewModal,
    setShowPaymentReviewModal: bool => dispatch(setShowPaymentReviewModal(bool)),
    showPixModal             : state.showPixModal,
    setShowPixModal          : bool => dispatch(setShowPix(bool)),
  };
}

export default useModalController;
