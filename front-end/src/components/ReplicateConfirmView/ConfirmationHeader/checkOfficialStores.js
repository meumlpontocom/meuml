import axios from "axios";
import { getToken } from "src/services/auth";

export async function checkOfficialStores(selectedAccountIds) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/get_official_stores`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      params: { accounts_ids: selectedAccountIds },
    });

    const data = response.data.data ?? [];
    return data;
  } catch (error) {
    return error;
  }
}
