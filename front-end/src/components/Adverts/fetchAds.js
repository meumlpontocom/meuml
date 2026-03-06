import axios from 'axios';
import { getToken } from '../../services/auth';

export async function fetchAds({ url, page }) {
  try {
    const response = await axios.get(`
      ${process.env.REACT_APP_API_URL}/advertisings?${url}&${page}
    `, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    return response;
  } catch (error) {
    return error;
  }
}