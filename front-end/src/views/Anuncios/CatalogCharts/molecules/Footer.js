import React from "react";
import { CRow } from "@coreui/react";
import GoBackBtn from "../atoms/GoBackBtn";
import ConfirmBtn from "../atoms/ConfirmBtn";

export default function Footer() {
  return (
    <CRow className="d-flex justify-content-between" style={{ paddingLeft: "16px", paddingRight: "16px" }}>
      <GoBackBtn />
      <ConfirmBtn />
    </CRow>
  );
}
