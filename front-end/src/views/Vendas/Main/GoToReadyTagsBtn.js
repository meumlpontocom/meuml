import React from "react";
import { Link } from "react-router-dom";

export default function GoToReadyTagsBtn() {
  return (
    <div className="mr-2">
      <Link className="btn btn-info btn-sm" to="/vendas/etiquetas">
        <i className="cil-check-circle mr-1 icon-fix" />
        Etiquetas prontas
      </Link>
    </div>
  );
}
