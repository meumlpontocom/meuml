import React from "react";

export default function AdvertPositioning({ position }) {
  return (
    <p style={{ padding: "0px", marginBottom: "0.1rem" }}>
      <i className="cil-list-numbered mr-1" />
      Posicionamento:{" "}
      <span className={typeof position !== "number" ? "text-danger" : "text-success"}>{position}</span>
    </p>
  );
}
