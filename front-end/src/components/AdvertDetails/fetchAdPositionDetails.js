import axios from "axios";
import { getToken } from "../../services/auth";

export default async function fetchAdPositionDetails(id) {
  try {
    const url = `advertisings/position_details?advertising_id=${id}`;
    return await axios.get(`${process.env.REACT_APP_API_URL}/${url}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    if (error.response) {
      return error.resopnse;
    }
    return error;
  }
}
