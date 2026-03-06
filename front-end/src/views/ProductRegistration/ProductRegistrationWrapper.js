import React, { useEffect, useContext } from "react";
import { v4 as uuidv4 }                 from "uuid";
import { CRow, CCol }                   from "@coreui/react";
import ProductCard                      from "./ProductCard";
import AttributesCard                   from "./AttributesCard";
import FooterButtons                    from "./FooterButtons";
import { ProductRegistrationContext }   from "./ProductRegistrationContext";
import styled                           from "styled-components";
import ImagesCard                       from "./ImagesCard";
import { useHistory }                   from "react-router-dom";

const ProductRegistrationStyles = styled.div`
  @media (max-width: 1500px) {
    .cards-container {
      flex-direction: column;

      div {
        max-width: 100%;
      }
    }
  }
  @media (max-width: 500px) {
    .input-group-text {
      display: none;
    }
  }
`;

const ProductRegistrationWrapper = ({
  isEditing,
  productToEdit,
  isVariation,
  parentID,
  parentSKU,
}) => {
  const { setProductInfo, setProductAttributesList } = useContext(
    ProductRegistrationContext
  );
  const history = useHistory();

  useEffect(() => {
    if (productToEdit && (isEditing || isVariation)) {
      const product = history.location.state?.item;

      if (product) setProductInfo({ ...product, attributes: [] });
      
      if (product.attributes?.length) {
        setProductAttributesList(
          product.attributes.map((attribute) => ({
            ...attribute,
            id: uuidv4(),
          }))
        );
      }
    }
  }, [
    history.location.state?.item,
    isEditing,
    isVariation,
    productToEdit,
    setProductAttributesList,
    setProductInfo,
  ]);

  return (
    <ProductRegistrationStyles>
      <CRow className="cards-container">
        <CCol xs="12" lg="6" className="product-card-container">
          <ProductCard
            isVariation={isVariation}
            parentID={parentID}
            parentSKU={parentSKU}
          />
        </CCol>
        <CCol xs="12" lg="6">
          <AttributesCard />
        </CCol>
        <CCol xs="12">
          <ImagesCard />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <FooterButtons
            isEditing={isEditing}
            isVariation={isVariation}
            parentID={parentID}
          />
        </CCol>
      </CRow>
    </ProductRegistrationStyles>
  );
};

export default ProductRegistrationWrapper;
