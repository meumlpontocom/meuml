import React from "react";

export default function Id({ id, advertLink }) {
  return (
    <a
      target="_blank"
      href={advertLink}
      rel="noopener noreferrer"
      style={{ color: "#919187" }}
    >
      {id}
    </a>
  );
}
