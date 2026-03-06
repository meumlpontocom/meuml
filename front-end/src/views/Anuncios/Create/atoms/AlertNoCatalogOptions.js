import React, { useContext }     from "react";
import { CAlert }                from "@coreui/react";
import { createMlAdvertContext } from "../createMlAdvertContext";

const AlertNoCatalogOptions = () => {
  const { catalogOptions } = useContext(createMlAdvertContext);
  return !catalogOptions.length ? (
    <CAlert color="danger">
      Esta publicação não possui os requisitos necessários para entrar em catálogo ou
      não possui nenhum catálogo compatível com seus detalhes.
    </CAlert>
  ) : <></>;
};

export default AlertNoCatalogOptions;
