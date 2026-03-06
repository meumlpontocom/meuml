import React           from "react";
import { CCard, CCol } from "@coreui/react";
import LoadingCardData from "src/components/LoadingCardData";

function LoadingContainer({ children, isLoading, cardClassName }) {
  return (
    <CCol xs="12">
      {isLoading ? (
        <CCard className={cardClassName}>
          <LoadingCardData color={cardClassName.match("danger") ? "#E55353" : ""} />
        </CCard>
      ) : (
        children
      )}
    </CCol>
  );
}

export default LoadingContainer;
