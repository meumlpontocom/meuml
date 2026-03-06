import React              from "react";
import ProductData        from "./ProductData";
import { CCollapse }      from "@coreui/react";
import VariationsTable    from "./VariationsTable";
import LoadingContainer   from "./LoadingContainer";

export default function DetailsCollapse({
  isOpen,
  editVariation,
  isLoadingDetails,
  collapsedProductDetails,
}) {
  return (
    <LoadingContainer isLoading={isOpen && isLoadingDetails}>
      <CCollapse show={isOpen} style={{ backgroundColor: "#ebedef" }} className="border-primary">
        <ProductData
          images={collapsedProductDetails.images}
          variations={collapsedProductDetails.variations}
          attributes={collapsedProductDetails.attributes}
          description={collapsedProductDetails.description}
          dateModified={collapsedProductDetails.date_modified}
        />
        <VariationsTable
          editVariation={editVariation}
          parentAttributes={collapsedProductDetails.attributes}
          variations={collapsedProductDetails.variations}
        />
      </CCollapse>
    </LoadingContainer>
  );
}
