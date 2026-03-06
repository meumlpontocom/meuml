import api from "../../services/api";
import { getToken } from "../../services/auth";

export async function fetchModules() {
  try {
    const url = "/subscribe";
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return { ...response.data.data };
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    return error;
  }
}

export default async function fetchSubscriptionDetails() {
  try {
    const url = "/subscriptions/details";
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return { ...response.data };
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    return error;
  }
}
