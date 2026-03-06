import React from "react";
import { Link } from "react-router-dom";

export default function QualityDetails({
  externalId,
  thumbnail,
  title,
  accountId,
}) {
  return (
    <Link
      className="dropdown-item"
      to={{
        pathname: `/qualidade-do-anuncio/${externalId}`,
        state: {
          externalId,
          thumbnail,
          title,
          accountId,
        },
      }}
    >
      <i className="cil-find-in-page mr-1" />
      Detalhes da qualidade
    </Link>
  );
}
