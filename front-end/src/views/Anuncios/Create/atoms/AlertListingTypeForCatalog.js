import React, { useContext }     from "react";
import { CAlert }                from "@coreui/react";
import UpperCaseStrongSpan       from "./UpperCaseStrongSpan";
import { createMlAdvertContext } from "../createMlAdvertContext";

const AlertListingTypeForCatalog = () => {
  const { form } = useContext(createMlAdvertContext);
  return form.listingType !== "gold_pro" ? (
    <CAlert color="danger">
      <p>
        A publicação deve ser do tipo&nbsp;
        <UpperCaseStrongSpan children="premium" navigateOnClick="advert-listingType-card" />
        &nbsp;para participar do catálogo.
      </p>
    </CAlert>
  ) : <></>;
};

export default AlertListingTypeForCatalog;
