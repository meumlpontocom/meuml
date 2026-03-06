import React    from "react";
import { CCol } from "@coreui/react";

const Column = ({ children }) => {
  return (
    <CCol xs="12" md="10" xl="6" className="mt-4">
      {children}
    </CCol>
  );
};

export default Column;
