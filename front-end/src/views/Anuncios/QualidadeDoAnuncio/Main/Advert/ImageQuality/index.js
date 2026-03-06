import React, { useMemo } from "react";

export default function ImageQuality({ quality }) {
  const icon = useMemo(() => {
    if (quality === "Ruim") return "cil-image-broken mr-1";
    else return "cil-image-plus mr-1";
  }, [quality]);

  return (
    <p>
      <i className={icon} />
      Qualidade das imagens:{" "}
      <span className={quality === "Ruim" ? "text-danger" : "text-success"}>{quality}</span>
    </p>
  );
}
