import {
  DASHBOARD_TOGGLE_LOADING,
  DASHBOARD_DEFINE_PERIOD,
  DASHBOARD_SAVE_DATA,
  DASHBOARD_SAVE_META,
  DASHBOARD_SET_PERIOD,
} from "./action-types";

export function toggleLoading() {
  return { type: DASHBOARD_TOGGLE_LOADING };
}

export function definePeriod() {
  return { type: DASHBOARD_DEFINE_PERIOD };
}

export function saveDashboardData(data) {
  return { type: DASHBOARD_SAVE_DATA, payload: data };
}

export function saveDashboardMeta(meta) {
  return { type: DASHBOARD_SAVE_META, payload: meta };
}

export function setPeriodDate({ fromDate, toDate }) {
  return { type: DASHBOARD_SET_PERIOD, payload: { fromDate, toDate } };
}
