import axios from "axios";
import { getToken } from "../../services/auth";

const fetchAdViewsByDate = async (id, dateFrom, dateTo) => {
  try {
    const url = `advertisings/visits_details?advertising_id=${id}&window_from=${dateFrom}&window_to=${dateTo}`;
    return await axios.get(`${process.env.REACT_APP_API_URL}/${url}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    return error;
  }
};

export default fetchAdViewsByDate;
