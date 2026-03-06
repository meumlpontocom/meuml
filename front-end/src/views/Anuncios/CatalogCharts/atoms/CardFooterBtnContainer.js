import React                 from "react";
import { CCardFooter, CCol } from "@coreui/react";

export const CardFooterBtnContainer = ({ children }) => {
  return (
    <CCardFooter>
      <CCol xs="12" lg="6" className="mt-2 mt-sm-0" style={{ padding: 0 }}>
        {children}
      </CCol>
    </CCardFooter>
  );
};
