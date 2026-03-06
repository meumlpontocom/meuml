/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import api, { headers } from "../../../services/api";

const useNavigateCategoriesTree = (selectedCategoryId, setCategoriesTree) => {
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [selectedCategoryAttributes, setSelectedCategoryAttributes] = useState({});
  const fetchNavigation = useCallback(async ({ categoryId, includeAttributes }) => {
    try {
      setIsLoadingAttributes(true);
      const url = `/categories-tree?category_id=${categoryId}&include_attributes=${includeAttributes}`;
      const response = await api.post(url, {}, headers());
      if (!response.data.data.is_leaf) {
        setCategoriesTree(response.data.data.children);
      } else {
        setSelectedCategoryAttributes(response.data.data);
      }
    } catch (error) {
      return error.response?.data?.message || error.message;
    } finally {
      setIsLoadingAttributes(false);
    }
  }, []);
  useEffect(() => {
    if (selectedCategoryId) {
      fetchNavigation({
        categoryId: selectedCategoryId,
        includeAttributes: 1,
      }).then(error => {
        if (error) {
          console.log(error);
          Swal.fire({
            title: "Erro!",
            text: error,
            type: "error",
            showCloseButton: true,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: "Fechar",
          });
        }
      });
    } else {
      setSelectedCategoryAttributes({});
    }
  }, [selectedCategoryId]);
  return [isLoadingAttributes, selectedCategoryAttributes];
};

export default useNavigateCategoriesTree;
