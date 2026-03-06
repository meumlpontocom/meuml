import api from "../../../../../../services/api";
import { getToken } from "../../../../../../services/auth";

export default async function fetchDescription({ id, setNewDescription, setIsLoadingDescription }) {
  try {
    const { data } = await api.get(`/advertisings/${id}/description`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setNewDescription(data.data.description.plain_text);
  } catch (error) {
    console.log(error);
  } finally {
    setIsLoadingDescription(false);
  }
}
