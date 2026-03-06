import React, { useContext } from "react";
import { CCol } from "@coreui/react";
import { FaStore } from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const MarketplacePublicationNotice = () => {
  const { form } = useContext(createMlAdvertContext);
  return (
    <CCol xs="12" style={{ paddingLeft: 0 }}>
      {form.createClassicAdvert && (
        <h4 className="text-muted">
          <FaStore className="mr-1 text-warning" />
          Este anúncio será publicado no&nbsp;
          <span className="text-warning">marketplace</span> do Mercado Livre
        </h4>
      )}
    </CCol>
  );
};

export default MarketplacePublicationNotice;
