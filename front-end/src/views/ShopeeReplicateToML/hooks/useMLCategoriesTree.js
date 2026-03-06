import { useCallback, useEffect, useState } from "react";
import Swal                                 from "sweetalert2";
import api, { headers }                     from "../../../services/api";

const useMlCategoriesTree = () => {
  const [categoriesTree, setCategoriesTree] = useState(() => []);
  const showAlertError = useCallback((error) => {
    const showAlert = async (message) => {
      await Swal.fire({
        title: "Erro!",
        text: message,
        type: "error",
        showCancelButton: true,
        cancelButtonText: "Fechar",
        showConfirmButton: false,
        showCloseButton: true,
      });
    };
    // noinspection JSIgnoredPromiseFromCall
    showAlert(error.response ? error.response.data.message : error.message || error);
  }, []);
  const fetchCategoriesTree = useCallback(async () => {
    try {
      const url = "/categories-tree";
      const response = await api.get(url, headers());
      return { data: { error: false, data: response.data?.data || [] } };
    } catch (error) {
      return { data: { error, data: [] } };
    }
  }, []);
  const handleCategoriesTree = useCallback(async () => {
    const { error, data: { data } } = await fetchCategoriesTree();
    error ? showAlertError(error) : setCategoriesTree(data);
  }, [fetchCategoriesTree, showAlertError]);
  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    handleCategoriesTree();
  }, [handleCategoriesTree]);
  return categoriesTree;
};

export default useMlCategoriesTree;
