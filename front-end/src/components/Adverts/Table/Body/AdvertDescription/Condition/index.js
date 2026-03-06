import React from "react";

export default function Condition({ status, condition }) {
  return status ? (
    <>
      <span>
        {condition === "used" ? (
          <span
            className="d-flex align-items-center"
            style={{ color: "#8a4f3899" }}
          >
            <i className="cil-filter-photo mr-1" />
            Produto Usado
          </span>
        ) : condition === "new" ? (
          <span
            className="d-flex align-items-center"
            style={{ color: "#3b6af799" }}
          >
            <i className="cil-filter-photo mr-1" />
            Produto Novo
          </span>
        ) : null}
      </span>
      <br />
    </>
  ) : null;
}
