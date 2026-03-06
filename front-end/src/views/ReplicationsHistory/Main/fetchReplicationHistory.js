import { getToken } from "../../../services/auth";
import api from "../../../services/api";

export default async function fetchReplicationHistory(page) {
  try {
    const response = await api.get("/replications-history", {
      headers: { Authorization: `Bearer ${getToken()}` },
      params: { page },
    });

    const status = response.data.status;
    const message = response.data.message;

    if (status !== "success" || message !== "Replicações encontradas") {
      throw new Error(message);
    }

    const replicationHistory = response.data.data ?? [];
    const meta = response.data.meta;
    return { replications: replicationHistory, meta };
  } catch (error) {
    throw new Error(error?.response?.data?.message || error);
  }
}
