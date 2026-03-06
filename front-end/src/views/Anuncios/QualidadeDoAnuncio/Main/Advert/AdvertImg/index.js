import React from "react";

export default function AdvertImg({ title, thumbnail }) {
  return (
    <td style={{ verticalAlign: "middle", backgroundColor: "#fff" }} className="text-center">
      <img
        className="table-image"
        id="table-img"
        title={title}
        src={thumbnail}
        alt="Imagem-Anúncio"
        width={75}
      />
    </td>
  );
}
