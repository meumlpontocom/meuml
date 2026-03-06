import Swal             from "sweetalert2";
import api, { headers } from "src/services/api";

export const fetchUserInfoByNickname = async (nickname) => {
  try {
    return await api.get(`/user/info?nickname=${nickname}`, headers());
  } catch (error) {
    await Swal.fire({
      title: "Atenção!",
      text: error.response?.data?.message || error.message || error,
      type: "error",
      showCloseButton: true,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Fechar"
    });
  }
}
