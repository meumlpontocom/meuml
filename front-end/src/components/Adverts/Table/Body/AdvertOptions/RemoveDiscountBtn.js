import React from "react";
import Swal from "sweetalert2";
import api from "../../../../../services/api";

export default function RemoveDiscountBtn({ id, originalPrice }) {
  const anyDiscountApplied = originalPrice !== null;
  const dynamicClassName = anyDiscountApplied
    ? "dropdown-item"
    : "dropdown-item disabled";
  const fetchRemoveDiscount = async (confirmed = 0) => {
    try {
      if (id !== null && id !== undefined) {
        const baseURL = `/advertisings/discounts?confirmed=${confirmed}&select_all=0&advertisings_id=${id}`;
        const response = await api.delete(baseURL);
        if (!confirmed) {
          Swal.fire({
            title: "Atenção",
            html: `<p>${response.data.message}</p>`,
            type: response.data.status,
            showConfirmButton: true,
            confirmButtonText: "Prosseguir",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
          }).then((user) => {
            if (user.value) {
              fetchRemoveDiscount(1);
            }
          });
        } else
          Swal.fire({
            title: "Atenção",
            html: `<p>${response.data.message}</p>`,
            type: response.data.status,
            showCloseButton: true,
          });
      }
    } catch (error) {
      if (error.response) {
        Swal.fire({
          title: "Atenção!",
          html: `<p>${error.response.data?.message}</p>`,
          type: error.response.data?.status,
          showCloseButton: true,
        });
      } else {
        Swal.fire({
          title: "Atenção!",
          html: `<p>${error.message ? error.message : error}</p>`,
          type: "error",
          showCloseButton: true,
        });
      }
    }
  };
  return (
    <div
      className={dynamicClassName}
      name="removeDiscountBtn"
      id="removeDiscountBtn"
      onClick={() => fetchRemoveDiscount()}
    >
      Remover Desconto
    </div>
  );
}
