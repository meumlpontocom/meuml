import React, { useContext }     from "react";
import { CCol }                  from "@coreui/react";
import { FaBook }                from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const CatalogPublicationNotice = () => {
  const { form, shouldEvaluateModerationEligibility } = useContext(createMlAdvertContext);
  return !shouldEvaluateModerationEligibility ? (
    <CCol xs="12" style={{ paddingLeft: 0 }}>
      {form.createCatalogAdvert && (
        <h4 className="text-muted">
          <FaBook className="mr-1 text-success" />
          Este anúncio será publicado no&nbsp;
          <span className="text-success">
            Catálogo de {form.selectedCategory.domain_name}
          </span>
        </h4>
      )}
    </CCol>
  ) : <></>;
};

export default CatalogPublicationNotice;
