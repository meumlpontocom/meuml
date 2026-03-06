import React, { useContext }     from "react";
import { CAlert }                from "@coreui/react";
import { FaInfoCircle }          from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const AlertCatalogModeration = () => {
  const { shouldEvaluateModerationEligibility } = useContext(createMlAdvertContext);
  return shouldEvaluateModerationEligibility ? (
    <CAlert color="danger" className="mt-3">
      <em>
        <FaInfoCircle/>&nbsp;Este anúncio deverá entrar em um catálogo após a publicação, em prazo definido pelo Mercado Livre.
        <strong>&nbsp;Lembre-se de selecionar um catálogo após a criação deste anúncio.</strong>
      </em>
    </CAlert>
  ) : <></>;
};

export default AlertCatalogModeration;
