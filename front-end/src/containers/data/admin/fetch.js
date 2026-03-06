// import api from "../../../services/api";
import axios from "axios";
import { getToken } from "../../../services/auth";
import { saveAccounts } from "../../../redux/actions";

export async function apiPatch(url) {
  try {
    const token = getToken();
    const response = await axios.patch(
      process.env.REACT_APP_API_URL + url,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    switch (response.status) {
      case 200:
        return {
          status: response.data.status,
          message: response.data.message,
          data: response.data,
        };
      default:
        return {
          status: "error",
          message:
            "Algo deu errado. Se o erro persistir, contate a equipe de desenvolvimento.",
        };
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

export async function apiGet({ url, dispatch }) {
  try {
    const response = await axios.get(process.env.REACT_APP_API_URL + url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    switch (response.status) {
      case 200:
        dispatch(saveAccounts(response.data.data));
        return {
          status: response.data.status,
          message: response.data.message,
          data: response.data,
        };
      default:
        return {
          status: "error",
          message:
            "Algo deu errado. Se o erro persistir, contate a equipe de desenvolvimento.",
        };
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}
