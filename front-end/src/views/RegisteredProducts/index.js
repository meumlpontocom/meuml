import React                           from "react";
import RegisteredProductsPage          from "./RegisteredProductsPage";
import { RegisteredProductsProvider }  from "./RegisteredProductsContext";
import { ProductRegistrationProvider } from "../ProductRegistration/ProductRegistrationContext";

const RegisteredProducts = () => {
  return (
    <ProductRegistrationProvider>
      <RegisteredProductsProvider>
        <RegisteredProductsPage />
      </RegisteredProductsProvider>
    </ProductRegistrationProvider>
  );
};

export default RegisteredProducts;
