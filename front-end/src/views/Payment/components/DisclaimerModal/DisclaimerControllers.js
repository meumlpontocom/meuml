import CancelBtn                  from "./CancelBtn";
import ConfirmBtn                 from "./ConfirmBtn";
import { CContainer, CRow, CCol } from "@coreui/react";
import content                    from "./disclaimerTexts";

function DisclaimerControllers({ navigate, step }) {
  return (
    <CContainer fluid>
      <CRow className="d-flex flex-row justify-content-between">
        <CCol>
          <CancelBtn step={step} handleClick={navigate} />
        </CCol>
        <CCol className="text-right">
          <ConfirmBtn step={step} content={content} handleClick={navigate} />
        </CCol>
      </CRow>
    </CContainer>
  );
}

export default DisclaimerControllers;
