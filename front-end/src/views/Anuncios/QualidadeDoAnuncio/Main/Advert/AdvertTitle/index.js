import React from "react";

export default function AdvertTitle({ title, account }) {
  return (
    <h6 style={{ padding: "0px", marginBottom: "0.1rem" }}>
      <span className="strong text-dark">
        <b>{title}</b>{" "}
      </span>
      <span className="text-muted">({account})</span>
    </h6>
  );
}
