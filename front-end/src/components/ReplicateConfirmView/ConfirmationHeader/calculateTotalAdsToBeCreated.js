import axios from "axios";
import { getToken } from "src/services/auth";

export async function calculateTotalAdsToBeCreated(mlAccountId, mlCategoryId, spAdvertisingId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/shopee/calculate_replication_cost`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      params: {
        ml_account_id: mlAccountId,
        ml_category_id: mlCategoryId,
        advertising_id: spAdvertisingId,
      },
    });

    const data = response.data.data.total_variations ?? 1;
    return data;
  } catch (error) {
    return error;
  }
}
