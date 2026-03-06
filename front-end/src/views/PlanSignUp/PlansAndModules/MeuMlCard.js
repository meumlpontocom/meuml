import React                             from "react";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";
import ModulesList                       from "./ModulesList";

const MeuMlCard = () => {
  return (
    <CCard>
      <CCardHeader className="bg-dark text-white">
        <h5 className="mb-0">Selecione módulos abaixo (MeuML)</h5>
      </CCardHeader>
      <CCardBody>
        <ModulesList platform="MeuML" />
      </CCardBody>
    </CCard>
  );
};

export default MeuMlCard;
