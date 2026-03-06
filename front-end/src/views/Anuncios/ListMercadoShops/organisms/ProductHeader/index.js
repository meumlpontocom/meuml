

import React              from "react";

import {
  CRow,
  CCol,
  CCardHeader
} from "@coreui/react";

import ProductFilters     from "../ProductFilters/index";

export default function ProductHeader() {

  return (
    <CCardHeader>
      <CRow name="filter-row" id="filters-row">
        <CCol xl="12" sm="12" md="12" lg="12" xs="12">
          <ProductFilters />
        </CCol>
      </CRow>
    </CCardHeader>
  );
}
