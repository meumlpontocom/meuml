import React from "react";
import { Link } from "react-router-dom";

export default function ImgQualityDetails({ accountId, advertId, secureThumbnail }) {
  return (
    <Link
      className="dropdown-item"
      to={{
        pathname: `/qualidade-das-imagens`,
        state: { advertId, accountId, secureThumbnail },
      }}
    >
      <i className="cil-image-plus mr-1" />
      Qualidade das Imagens
    </Link>
  );
}
