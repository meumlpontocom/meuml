import React                                            from "react";
import { ConfirmAdvertCreationBtn, Row }                from "../atoms";
import { Attributes, Catalog, ImageUpload, Variations } from "../organisms";
import { CCol, CContainer }                             from "@coreui/react";
import CatalogCharts                                    from "../molecules/CatalogCharts";
import PageHeader                                       from "src/components/PageHeader";
import AccountsDropdown                                 from "src/components/AccountsDropdown";
import ShippingModeSelect                               from "../molecules/inputs/ShippingModeSelect";
import {
  AvailableQuantityInput,
  Category,
  ConditionSelect,
  DescriptionTextarea,
  ListingTypeSelect,
  PriceInput,
  TitleInput,
  MShops,
}                                                       from "../molecules";

export default function Template() {
  return (
    <CContainer>
      <Row>
        <CCol xs="12">
          <PageHeader heading="Criar anúncio" subheading="Mercado Livre" />
        </CCol>
        <CCol xs="12">
          <AccountsDropdown xs="12" multiple={true} platform="ML" placeholder="Selecionar uma conta ML" />
        </CCol>
        <CCol xs="12">
          <TitleInput />
        </CCol>
        <CCol xs="12">
          <Category />
        </CCol>
        <CCol xs="12">
          <ConditionSelect />
        </CCol>
        <CCol xs="12">
          <PriceInput />
        </CCol>
        <CCol xs="12">
          <AvailableQuantityInput />
        </CCol>
        <CCol xs="12">
          <Attributes />
        </CCol>
        <CCol xs="12">
          <CatalogCharts />
        </CCol>
        <CCol xs="12">
          <ImageUpload />
        </CCol>
        <CCol xs="12">
          <Variations />
        </CCol>
        <CCol xs="12">
          <DescriptionTextarea />
        </CCol>
        <CCol xs="12">
          <ListingTypeSelect />
        </CCol>
        <CCol xs="12">
          <ShippingModeSelect />
        </CCol>
        <CCol xs="12">
          <MShops />
        </CCol>
        <CCol xs="12">
          <Catalog />
        </CCol>
        <CCol xs="12">
          <ConfirmAdvertCreationBtn className="float-right" />
        </CCol>
      </Row>
    </CContainer>
  );
}
