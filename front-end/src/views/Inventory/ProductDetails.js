import React, { useEffect, useState } from "react";
import LoadingCardData from "src/components/LoadingCardData";
import { getWarehousesContainingProduct } from "./inventoryRequests";
import ProductDetailCard from "./ProductDetailCard";

const ProductDetails = ({ item, setDetails, shouldFetchStock, isOpen }) => {
  const [isPending, setIsPending] = useState(true);
  const [warehousesContainingProduct, setWarehousesContainingProduct] =
    useState([]);

  useEffect(() => {
    if (item && isOpen && shouldFetchStock) {
      // setWarehousesContainingProduct([]);
      async function getProductStockDetails() {
        setIsPending(true);
        const warehouses = await getWarehousesContainingProduct(item.id).then(
          (res) => res?.data.data
        );
        warehouses && setWarehousesContainingProduct(warehouses);
        setIsPending(false);
      }
      getProductStockDetails();
    }

    return setWarehousesContainingProduct([]);
  }, [item, setDetails, shouldFetchStock, isOpen]);

  if (isPending) return <LoadingCardData color="#321fdb" />;
  if (warehousesContainingProduct.length < 1) return null;

  return warehousesContainingProduct.map((warehouse) => (
    <ProductDetailCard
      key={warehouse.warehouse_id}
      warehouse={warehouse}
      item={item}
    />
  ));
};

export default ProductDetails;
