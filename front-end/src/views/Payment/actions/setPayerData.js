import { SET_CURRENT_USER_FORM_TAB, SET_PAYER_DATA, SET_USER_DATA_HISTORY } from "./types";

export const setPayerData        = (data) => ({ type: SET_PAYER_DATA, payload: data });
export const setPayerDataHistory = (data) => ({ type: SET_USER_DATA_HISTORY, payload: data });
export const setPayerDataFormTab = (tab)  => ({ type: SET_CURRENT_USER_FORM_TAB, payload: tab });