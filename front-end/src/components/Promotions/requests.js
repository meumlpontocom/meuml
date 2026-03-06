import Swal from "sweetalert2";
import api from "src/services/api";
import { getToken } from "src/services/auth";

export const applyPromotion = async ({
  confirmed = 0,
  promotionId,
  advertisingsIds,
}) => {
  try {
    const data = {
      "advertisings_id": advertisingsIds,
      "promotion_id": promotionId,
      "options": {
        "stock": null,
        "stock_range": "max",
        "discount_value": null,
        "is_discount_value_percentage": true,
      }
    }

    const response = await api.post(`/promotions?select_all=0&confirmed=${confirmed}`, data, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!confirmed) {
      const userConfirmation = await Swal.fire({
        title: "Atenção",
        text: response.data.message,
        status: "question",
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Confirmar"
      });
      if (userConfirmation.value) {
        await applyPromotion({ confirmed: 1 });
      }
    }
    await Swal.fire({
      title: "Atenção",
      text: response.data.message,
      type: "info",
      showCloseButton: true
    });
  } catch (error) {
    Swal.fire("Erro!", error.response.data.message || error.message, "error");
  }
}