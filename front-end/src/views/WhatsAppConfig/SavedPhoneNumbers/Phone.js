import React                         from "react";
import { CCol }                      from "@coreui/react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

function Phone({ isCardCollapsed, countryCode, areaCode, phoneNumber }) {
  return (
    <CCol xs="6" className="float-left">
      <h5>
        <span className="mr-2">{isCardCollapsed ? <FaCaretDown /> : <FaCaretRight />}</span>
        +{countryCode}&nbsp;{areaCode}&nbsp;{phoneNumber}&nbsp;
      </h5>
    </CCol>
  );
}

export default Phone;
