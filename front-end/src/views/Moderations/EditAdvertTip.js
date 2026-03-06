import React from "react";
import { CCol, CAlert } from "@coreui/react";

const ImageStorageTip = () => (
  <CCol xs={12} md={6} style={{ padding: "0px" }}>
    <CAlert color="info" className="d-flex align-items-center">
      <i className="cil-lightbulb mr-2" />
      <p className="mb-0">
        <em>
          Para acessar seu anúncio, clique no <strong>ID em azul.</strong>
        </em>
      </p>
    </CAlert>
  </CCol>
);

export default ImageStorageTip;
