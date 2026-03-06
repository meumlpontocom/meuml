import React, { useContext } from "react";
import { CCard, CCardBody } from "@coreui/react";
import CardHeader from "../atoms/CardHeader";
import { catalogChartsContext } from "../catalogChartsContext";
import { SearchCatalogChartsBtn } from "../atoms/SearchCatalogChartsBtn";
import { CardFooterBtnContainer } from "../atoms/CardFooterBtnContainer";
import { RequiredAttributesForm } from "./RequiredAttributesForm";

const CategoryRequiredAttributes = () => {
  const { categoryRequiredAttributes } = useContext(catalogChartsContext);

  return categoryRequiredAttributes.length ? (
    <CCard>
      <CardHeader text="Atributos obrigatórios" />
      <CCardBody>
        <RequiredAttributesForm />
      </CCardBody>
      <CardFooterBtnContainer>
        <SearchCatalogChartsBtn />
      </CardFooterBtnContainer>
    </CCard>
  ) : (
    <></>
  );
};

export default CategoryRequiredAttributes;
