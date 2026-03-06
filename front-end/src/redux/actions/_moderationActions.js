import {
  MODERATION_TOGGLE_LOADING,
  MODERATION_SAVE_MODERATIONS_DATA,
  MODERATION_SAVE_META,
  MODERATION_SAVE_SELECTED_FROM_DATE,
  MODERATION_SAVE_SELECTED_TO_DATE,
  MODERATION_SAVE_SELECTED_ACCOUNT,
  MODERATION_SAVE_ADS_MODERATED_PER_ACCOUNT
} from "./action-types";

export function saveSelectedAccount(selectedAccount) {
  return { type: MODERATION_SAVE_SELECTED_ACCOUNT, payload: selectedAccount };
}

export function saveSelectedFromDate(date) {
  return { type: MODERATION_SAVE_SELECTED_FROM_DATE, payload: date };
}

export function saveSelectedToDate(date) {
  return { type: MODERATION_SAVE_SELECTED_TO_DATE, payload: date };
}

export function toggleModerationsLoading() {
  return { type: MODERATION_TOGGLE_LOADING };
}

export function saveModerationsData(data) {
  return { type: MODERATION_SAVE_MODERATIONS_DATA, payload: data };
}

export function saveModerationsMeta(meta) {
  return { type: MODERATION_SAVE_META, payload: meta };
}

export function saveModerationsByAccount(accountList) {
  return { type: MODERATION_SAVE_ADS_MODERATED_PER_ACCOUNT, payload: accountList };
}
