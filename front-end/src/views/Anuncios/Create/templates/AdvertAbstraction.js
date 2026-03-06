import React                                                                                   from "react";
import PageHeader                                                                              from "src/components/PageHeader";
import { CCard, CCardBody, CCardFooter, CCol, CContainer, CRow }                               from "@coreui/react";
import { AdCover, DisplayDescription, SelectVariation, ConfirmAdvertCreationBtn, GoBackBtn }   from "../atoms";
import { DisplayAttributes, CommonInfoSection, TitleAndPriceSection,PublishingMethodsSection } from "../molecules";

const AdvertAbstraction = () => {
  return (
    <CContainer>
      <PageHeader heading="Revisar anúncio" subheading="Confira as informações antes da publicação" />

      <SelectVariation />

      <CCard className="border-primary">
        <CRow gutters={false}>
          <AdCover />
          <CCol md="7">
            <CCardBody>
              <CCol xs="12" style={{ padding: 0 }} id="advert-basic-information">
                <TitleAndPriceSection />
                <CommonInfoSection />
                <hr />
              </CCol>
              <DisplayAttributes />
              <hr />
              <PublishingMethodsSection />
              <hr />
            </CCardBody>
          </CCol>
        </CRow>

        <DisplayDescription />

        <CCardFooter>
          <CRow className="align-content-center justify-content-between">
            <CCol>
              <GoBackBtn />
            </CCol>
            <CCol>
              <ConfirmAdvertCreationBtn className="float-right" />
            </CCol>
          </CRow>
        </CCardFooter>
      </CCard>
    </CContainer>
  );
};

export default AdvertAbstraction;
