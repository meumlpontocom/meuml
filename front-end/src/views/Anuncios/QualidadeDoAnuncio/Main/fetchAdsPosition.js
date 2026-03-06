import axios from 'axios';
import { getToken } from '../../../../services/auth';

export async function fetchAdsPosition(url, page) {
  try {
    const response = await axios.get(`
      ${process.env.REACT_APP_API_URL}/advertisings/quality?${url}&page=${page}
    `, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    return error;
  }
}