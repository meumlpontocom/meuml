import React                        from "react";
import GoBackBtn                    from "./GoBackBtn";
import SubmitBtn                    from "./SubmitBtn";
import { CRow, CCard, CCardFooter } from "@coreui/react";
import NoPaddingCol                 from "./NoPaddingCol";

const Controllers = () => {
  return (
    <NoPaddingCol xs={12} className="mt-5">
      <CCard>
        <CCardFooter className="bg-gradient-secondary">
          <CRow>
            <GoBackBtn />
            <SubmitBtn />
          </CRow>
        </CCardFooter>
      </CCard>
    </NoPaddingCol>
  );
};

export default Controllers;
