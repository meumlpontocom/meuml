import React, { useState, createContext } from "react";
import { handleError, getProductsList } from "./inventoryRequests";

export const InventoryContext = createContext();

export const InventoryProvider = (props) => {
  const [products, setProducts] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [productToEditStock, setProductToEditStock] = useState(null);
  const [mode, setMode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedSalesChannel, setSelectedSalesChannel] = useState(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [checkGenerateCode, setCheckGenerateCode] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);
  const [productStock, setProductStock] = useState(null);
  const [warehousesContainingProduct, setWarehousesContainingProduct] =
    useState(null);
  const [productBatches, setProductBatches] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState(0);
  const [numOfPages, setNumOfPages] = useState(1);
  const [activePage, setActivePage] = useState(1);

  async function getProducts(filterString, page, sortingOptions) {
    await getProductsList(filterString, page, sortingOptions)
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
  }

  return (
    <InventoryContext.Provider
      value={{
        isLoading,
        setIsLoading,
        products,
        setProducts,
        warehouses,
        setWarehouses,
        addModal,
        setAddModal,
        productToEditStock,
        setProductToEditStock,
        mode,
        setMode,
        isPending,
        setIsPending,
        selectedWarehouse,
        setSelectedWarehouse,
        selectedSalesChannel,
        setSelectedSalesChannel,
        quantityInput,
        setQuantityInput,
        transactionCode,
        setTransactionCode,
        checkGenerateCode,
        setCheckGenerateCode,
        expirationDate,
        setExpirationDate,
        productStock,
        setProductStock,
        warehousesContainingProduct,
        setWarehousesContainingProduct,
        productBatches,
        setProductBatches,
        selectedBatch,
        setSelectedBatch,
        warehouseStock,
        setWarehouseStock,
        numOfPages,
        setNumOfPages,
        getProducts,
        activePage,
        setActivePage,
      }}
    >
      {props.children}
    </InventoryContext.Provider>
  );
};
