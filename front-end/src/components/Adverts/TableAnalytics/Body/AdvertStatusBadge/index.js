import React, { useMemo } from "react";
import "./index.css";

const AdvertStatusBadge = ({ status }) => {
  const className = useMemo(() => {
    switch (status) {
      case "closed":
        return "table-line-danger";
      case "paused":
        return "table-line-warning";
      case "active":
        return "table-line-success";
      case "under_review":
        return "table-line-info";
      default:
        return "table-line-secondary";
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
    <td title={tooltip} className={className}>
      <br />
    </td>
  );
};

export default AdvertStatusBadge;
