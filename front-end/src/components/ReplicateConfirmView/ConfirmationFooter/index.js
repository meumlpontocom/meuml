import React from "react";
import GoBackBtn from "./GoBackBtn";
import { CCard, CCardBody, CCol, CRow } from "@coreui/react";
import BuyCreditsBtn from "./BuyCreditsBtn";
import ConfirmReplicationBtn from "./ConfirmReplicationBtn";

export default function ConfirmationFooter() {
  return (
    <CCard className="mt-4">
      <CCardBody>
        <CRow>
          <CCol>
            <GoBackBtn />
          </CCol>
          <CCol>
            <BuyCreditsBtn />
            <ConfirmReplicationBtn />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
}
