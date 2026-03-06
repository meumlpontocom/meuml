import React from "react";

export default function DetailBadge({ data, label }) {
  return (
    <span style={{ padding: "5px 5px", marginRight: "10px" }}>
      <span className="text-muted">{label}</span>
      <br />
      <span style={{ color: "#4D4D4D", fontSize: "19" }}>
        {typeof data === String() ? data.toUpperCase() : data}
      </span>
    </span>
  );
}
