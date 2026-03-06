import React from "react";
import { useSelector } from "react-redux";

export default function AccountName({ id }) {
  const name = useSelector(({ accounts }) => accounts.accounts[id]?.name || "-");
  return (
    <div className="details-container  d-flex justify-content-center align-items-center p-0 flex-start">
      <div className="icon-container d-flex justify-content-center align-items-center" title="email">
        <i className="cil-user icon" />
      </div>
      <div className="flex-grow-1 ml-1">
        <p className="m-0 pl-1">
          <span className="font-weight-bold text-muted d-block account-details mr-1">Usuário:</span>
          <span style={{wordBreak:"break-word"}} id={`account-name-${id}`}>{name}</span>
        </p>
      </div>
    </div>
  );
}
