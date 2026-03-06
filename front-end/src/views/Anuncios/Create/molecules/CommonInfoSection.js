import React                                                                             from "react";
import { CRow }                                                                          from "@coreui/react";
import { CustomSection, DisplayCondition, DisplayListingType, DisplayAvailableQuantity } from "../atoms";

const CommonInfoSection = () => {
  return (
    <CustomSection id="amount-condition-listinType">
      <CRow className="justify-content-between align-content-center">
        <DisplayAvailableQuantity />
        <DisplayCondition />
        <DisplayListingType />
      </CRow>
    </CustomSection>
  );
};

export default CommonInfoSection;
