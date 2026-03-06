import React from "react";

//CoreUI
import { CRow, CCol } from "@coreui/react";
// import { Row, Col } from "reactstrap";

import DeliverDetailsDefault from "./DeliverDetailsDefault";
import PaymentDetailsDefault from "./PaymentDetailsDefault";
import BuyersDetailsDefault from "./BuyersDetailsDefault";
import ItemsDetailsDefault from "./ItemsDetailsDefault";

import "./styles.scss";

const SalesDefault = ({ id }) => {
  return (
    <CRow>
      <CCol sm="12" md="12" lg="6" xl="5">
        <CRow>
          <CCol sm="12" className="pr-3 pl-lg-3">
            <DeliverDetailsDefault id={id} />
          </CCol>
          <CCol sm="12" className="pl-3 pl-lg-3">
            <PaymentDetailsDefault id={id} />
          </CCol>
          <CCol sm="12">
            <BuyersDetailsDefault id={id} />
          </CCol>
        </CRow>
      </CCol>
      <CCol sm="12" md="12" lg="6" xl="7" className="mx-0 pl-lg-0">
        <ItemsDetailsDefault id={id} />
      </CCol>
    </CRow>
  );
};

export default SalesDefault;
