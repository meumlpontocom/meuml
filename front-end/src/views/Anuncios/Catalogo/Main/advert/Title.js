import React from "react";

export default function Title({ title, permalink, externalId }) {
  return (
    <>
      <h6 style={{ padding: "0px", marginBottom: "0.1rem" }}>
        <span className="strong text-dark mr-1">
          <b>{title}</b>
        </span>
        <a
          target="_blank"
          className="text-muted"
          href={permalink}
          rel="noopener noreferrer"
          style={{ padding: "0px", cursor: "pointer" }}
        >
          ({externalId})
        </a>
      </h6>
    </>
  );
}
