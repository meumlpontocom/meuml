import React, { useState, createContext } from "react";

export const ProductRegistrationContext = createContext();

export const ProductRegistrationProvider = (props) => {
  const [productAttribute, setProductAttribute] = useState({
    field: "",
    value: "",
  });
  const [productInfo, setProductInfo] = useState({
    name: "",
    sku: "",
    description: "",
  });
  const [hasExpirationDate, setHasExpirationDate] = useState(false);
  const [productAttributesList, setProductAttributesList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [isPending, setIsPending] = useState(false);

  return (
    <ProductRegistrationContext.Provider
      value={{
        productInfo,
        setProductInfo,
        hasExpirationDate,
        setHasExpirationDate,
        productAttribute,
        setProductAttribute,
        productAttributesList,
        setProductAttributesList,
        productList,
        setProductList,
        isPending,
        setIsPending,
      }}
    >
      {props.children}
    </ProductRegistrationContext.Provider>
  );
};
