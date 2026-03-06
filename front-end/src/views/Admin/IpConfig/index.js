import React                      from "react";
import { CCol, CContainer, CRow } from "@coreui/react";
import GetIpFilter                from "./GetIpFilter";
import PostIpFilter               from "./PostIpFilter";
import DeleteIpFilter             from "./DeleteIpFilter";
import PageHeader                 from "src/components/PageHeader";

const IpConfig = () => {
  return (
    <CContainer>
      <PageHeader heading="IP Config" subheading="Manage Mercado Libre's API's whitelist" />
      <CRow>
        <CCol xs="12">
          <GetIpFilter />
        </CCol>
        <CCol xs="12">
          <PostIpFilter />
        </CCol>
        <CCol xs="12">
          <DeleteIpFilter />
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default IpConfig;
