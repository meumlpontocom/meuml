import React, { useMemo } from "react";

import { Container }      from "./styles.js";

const ProductStatusBadge = ({ status }) => {
  const colors = useMemo(() => {
    switch (status) {
      case "closed":
        return "#f86c6b";
      case "paused":
        return "#ffc107";
      case "active":
        return "#4dbd74";
      case "under_review":
        return "#63c2de";
      default:
        return "#c8ced3";
    }
  }, [status]);

  const tooltip = useMemo(() => {
    switch (status) {
      case "closed":
        return "Finalizado";
      case "paused":
        return "Pausado";
      case "active":
        return "Ativo";
      case "under_review":
        return "Em revisão";
      default:
        return "";
    }
  }, [status]);
  
  return (
    <Container colors={colors} title={tooltip}/>
    
  );
};

export default ProductStatusBadge;
