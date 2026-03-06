import React, { useContext }     from "react";
import { CAlert }                from "@coreui/react";
import { createMlAdvertContext } from "../createMlAdvertContext";

const AlertNoVariationsAllowed = () => {
  const { form } = useContext(createMlAdvertContext);
  return form.variations.length ? (
    <CAlert color="warning">
      <p>Anúncios com variações não podem participar de catálogo.</p>
      <p>Entretanto, você poderá fazer op-in da variação individualmente, na tela de anúncios.</p>
    </CAlert>
  ) : <></>;
};

export default AlertNoVariationsAllowed;
