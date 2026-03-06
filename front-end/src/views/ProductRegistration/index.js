import React                           from "react";
import PageHeader                      from "../../components/PageHeader";
import ProductRegistrationWrapper      from "./ProductRegistrationWrapper";
import { useHistory }                  from "react-router-dom";
import { ProductRegistrationProvider } from "./ProductRegistrationContext";

const ProductRegistration = () => {
  const history = useHistory();
  const isEditing = history.location.state?.isEditing;
  const isVariation = history.location.state?.isVariation;
  const product = history.location.state?.item;
  const parentSKU = product?.sku;
  const parentID = product?.id;

  let heading = "Cadastro de Produtos";
  if (isEditing) heading = "Editando produto";
  if (isVariation) heading = "Cadastro de variação";
  let subheading =
    product?.name?.length > 30
      ? product.name.slice(0, 30).concat("...")
      : product?.name;

  return (
    <ProductRegistrationProvider>
      <PageHeader heading={heading} subheading={subheading} />
      <ProductRegistrationWrapper
        isEditing={isEditing}
        productToEdit={product}
        isVariation={isVariation}
        parentID={parentID}
        parentSKU={parentSKU}
      />
    </ProductRegistrationProvider>
  );
};

export default ProductRegistration;
