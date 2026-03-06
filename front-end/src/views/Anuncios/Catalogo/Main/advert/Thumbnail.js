import React from "react";

import "./styles.scss";

export default function Thumbnail({ secureThumbnail }) {
  return (
    <td
      style={{
        verticalAlign: "middle",
        backgroundColor: "#fff",
      }}
    >
      <img
        src={secureThumbnail}
        className="table-image advert-catalog-thumb-display "
        alt="Capa do Anúncio"
        id="table-img"
        width={75}
      />
    </td>
  );
}
