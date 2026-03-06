import React, { useContext, useMemo } from "react";
import Main                           from "./Main";
import shopeeReplicateToMLContext     from "../../shopeeReplicateToMLContext";

const RequiredAttributesForm = () => {
  const { requiredAttributes } = useContext(shopeeReplicateToMLContext);
  const show = useMemo(
    () => !!requiredAttributes.length,
    [requiredAttributes.length],
  );
  return show ? <Main /> : <></>;
};

export default RequiredAttributesForm;
