import {
  SET_SHOW_DISCLAIMER_MODAL,
  SET_SHOW_PAYMENT_REVIEW_MODAL,
  SET_SHOW_PIX_MODAL,
  SET_SHOW_USER_DATA_FORM_MODAL,
} from "./types";

export const setShowDisclaimerModal = (bool) => ({
  type: SET_SHOW_DISCLAIMER_MODAL,
  payload: bool,
});

export const setShowUserDataFormModal = (bool) => ({
  type: SET_SHOW_USER_DATA_FORM_MODAL,
  payload: bool,
});

export const setShowPaymentReviewModal = (bool) => ({
  type: SET_SHOW_PAYMENT_REVIEW_MODAL,
  payload: bool,
});

export const setShowPixModal = (bool) => ({
  type: SET_SHOW_PIX_MODAL,
  payload: bool,
});