import React from "react";
import { Link } from "react-router-dom";

export default function PositioningHistory({ id }) {
  return (
    <Link
      className="dropdown-item"
      to={{
        from: "/posicionamento",
        pathname: `/posicionamento/${id}`,
        state: { advertID: id },
      }}
    >
      <i className="cil-list-numbered mr-1" />
      Ver Posicionamento
    </Link>
  );
}
