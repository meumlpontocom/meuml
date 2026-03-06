import api          from "../../services/api";
import { getToken } from "src/services/auth";
import Swal         from "sweetalert2";

export function handleError(error) {
  if (error.response) {
    Swal.fire({
      title: "Atenção",
      html: `<p>${error.response.data?.message}</p>`,
      type: error.response.data?.status,
      showCloseButton: true,
    });
  } else {
    Swal.fire({
      title: "Atenção",
      html: `<p>${error.message ? error.message : error}</p>`,
      type: "error",
      showCloseButton: true,
    });
  }
  return error;
}

export async function getWarehouses() {
  try {
    return await api.get("/warehouses", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    handleError(error);
    if (error.response?.data) {
      return { ...error.response.data }
    }
  }
}

export async function getWarehousesContainingProduct(id) {
  try {
    return await api.get(`/articles/${id}/stock`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    handleError(error);
  }
}

export async function getProductsList(
  filterString = "",
  page = 1,
  sortingOptions
) {
  const { sortName, sortOrder } = sortingOptions || "";
  const sortBy = sortName || "";
  const order = sortOrder || "";
  try {
    return await api.get(
      `/articles?filter_string=${filterString}&page=${page}&sort_name=${sortBy}&sort_order=${order}`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
  } catch (error) {
    handleError(error);
  }
}

export async function getProductVariations(id) {
  try {
    return await api.get(`/articles/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch (error) {
    handleError(error);
  }
}

export async function stockIncrease(productID, payload) {
  try {
    const res = await api.put(
      `/articles/${productID}/stock/increase`,
      payload,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );

    if (res.status === 200) {
      Swal.fire(
        "Sucesso",
        "Alteração de estoque feita com sucesso!",
        "success"
      );
    }

    return res;
  } catch (error) {
    handleError(error);
  }
}

export async function stockDecrease(productID, payload) {
  try {
    const res = await api.put(
      `/articles/${productID}/stock/decrease`,
      payload,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );

    if (res.status === 200) {
      Swal.fire(
        "Sucesso",
        "Alteração de estoque feita com sucesso!",
        "success"
      );
    }

    return res;
  } catch (error) {
    handleError(error);
  }
}

export async function getProductWarehouseStock(productID, warehouseID) {
  try {
    const res = await api.get(`/articles/${productID}/${warehouseID}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data?.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateProductSKU(productID, sku) {
  const payload = {
    id: productID,
    new_sku: sku,
  };
  try {
    const res = await api.put(`/articles/edit-sku`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (res.status === 200) {
      Swal.fire("Sucesso!", `${res.data?.message}`, `${res.data?.status}`);
    }

    return res;
  } catch (error) {
    handleError(error);
  }
}
