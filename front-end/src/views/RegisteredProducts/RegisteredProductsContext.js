import React, { createContext, useCallback, useState }                       from "react";
import Swal                                                                  from "sweetalert2";
import { deleteProductRequest, getProductDetailsRequest, getProductRequest } from "./requests";
import CallToAction                                                          from "src/views/CallToAction";

export const RegisteredProductsContext = createContext();

export const RegisteredProductsProvider = (props) => {
  const [error402, set402Error] = useState(() => false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [filterString, setFilterString] = useState("");
  const [selectedSortingOption, setSelectedSortingOption] = useState(null);
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 2,
    offset: 0,
    limit: 50,
    total: 0,
    last_page: 1,
    next_page: 1,
    first_page: 1,
    previous_page: 1,
  });

  async function getProducts(filterString, page, sortingOptions) {
    const res = await getProductRequest({
      page,
      filterString,
      sortingOptions,
      setLoading: (boolean) => {
        setIsLoading(boolean);
        setIsPending(boolean);
      },
    });
    if (res?.statusCode === 402) {
      set402Error(true);
    } else {
      setProducts(() => (res.data.data ? res.data.data : []));
      setPagination(() => res.data.meta);
    }
  }

  async function handleDelete(id, setIsPendingDelete) {
    const res = await deleteProductRequest(id, (boolean) => {
      setIsPending(boolean);
      setIsPendingDelete(boolean);
    });
    if (res.data.status === "success") {
      getProducts();
      await Swal.fire("Sucesso", "Produto excluído com sucesso!", "success");
    }
  }

  const fetchProductDetails = useCallback(async (id, setIsPendingDelete) => {
    const response = await getProductDetailsRequest(id, setIsPendingDelete);
    return response.data?.data;
  }, []);

  return error402 ? (
    <CallToAction />
  ) :(
    <RegisteredProductsContext.Provider
      value={{
        products,
        setProducts,
        isLoading,
        setIsLoading,
        isPending,
        setIsPending,
        getProducts,
        handleDelete,
        fetchProductDetails,
        filterString,
        setFilterString,
        selectedSortingOption,
        setSelectedSortingOption,
        pagination,
      }}
    >
      {props.children}
    </RegisteredProductsContext.Provider>
  );
};
