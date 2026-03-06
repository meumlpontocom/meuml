import api from "../../services/api";
import { getToken } from "../../services/auth";
import { toggleLoading, saveDashboardData, saveDashboardMeta } from "../../redux/actions/_dashboardActions";

export async function fetchDashboard({ dispatch, fromDate, toDate }) {
  try {
    dispatch(toggleLoading());
    const dateFilters = `from_date=${fromDate}&to_date=${toDate}`;
    const url = `/dashboard?${fromDate ? dateFilters : ""}`;
    const {
      data: { data, meta },
    } = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    dispatch(saveDashboardData({ ...data }));
    dispatch(saveDashboardMeta(meta));

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data.message : error.message ? error.message : error,
    };
  } finally {
    dispatch(toggleLoading());
  }
}
