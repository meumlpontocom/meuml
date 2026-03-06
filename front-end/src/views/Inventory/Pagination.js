import React, { useContext } from "react";
import { CPagination } from "@coreui/react";
import { InventoryContext } from "./InventoryContext";
import { getProductsList } from "./inventoryRequests";

const Pagination = ({ setDetails }) => {
  const {
    numOfPages,
    setIsPending,
    setNumOfPages,
    setProducts,
    handleError,
    activePage,
    setActivePage,
  } = useContext(InventoryContext);

  async function getProducts(page) {
    await getProductsList(undefined, page)
      .then((res) => {
        setNumOfPages(res.data?.meta.pages - 1);

        const productsList = res.data?.data.map((product) => {
          return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            qty_in_stock: product.qtd_total,
            qty_reserved: product.qtd_reserved,
            qty_available: product.qtd_available,
            has_expiration_date: product.has_expiration_date,
            is_parent: product.is_parent,
          };
        });
        setProducts(productsList);
      })
      .catch((error) => handleError(error));

    setIsPending(false);
  }

  async function handlePageChange(page) {
    setIsPending(true);
    await getProducts(page);
    setActivePage(page);
    setDetails({});
  }

  return (
    <CPagination
      activePage={activePage}
      pages={numOfPages}
      onActivePageChange={(page) => handlePageChange(page)}
    ></CPagination>
  );
};

export default Pagination;
