import React, { useContext }     from "react";
import { CAlert }                from "@coreui/react";
import UpperCaseStrongSpan       from "./UpperCaseStrongSpan";
import { createMlAdvertContext } from "../createMlAdvertContext";

const AlertProductConditionForCatalog = () => {
  const { form } = useContext(createMlAdvertContext);
  return form.condition !== "new" ? (
    <CAlert color="warning">
      <p>
        O produto deve ser&nbsp;
        <UpperCaseStrongSpan children="novo" navigateOnClick="advert-condition-card" />
        &nbsp;para participar do catálogo.
      </p>
    </CAlert>
  ) : <></>;
};

export default AlertProductConditionForCatalog;
