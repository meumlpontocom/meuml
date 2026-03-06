import React from "react";

export default function AccountName({ externalName }) {
  return (
    <>
      <span className="text-muted">
        <i className="cil-user mr-1" />
        Conta: {externalName}
      </span>
    </>
  );
}
