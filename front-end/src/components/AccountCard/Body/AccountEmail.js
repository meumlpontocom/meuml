import React from "react";
import { useSelector } from "react-redux";

export default function AccountEmail({ id }) {
  const email = useSelector(
    ({ accounts }) => accounts.accounts[id]?.external_email || "-"
  );

  const platform = useSelector(
    ({ accounts }) => accounts.accounts[id]?.platform
  );

  const status = useSelector(
    ({ accounts: { accounts } }) => accounts[id]?.status
  );

  return (
    <div className="details-container  d-flex justify-content-center align-items-center p-0 flex-start">
      <div
        className="icon-container d-flex justify-content-center align-items-center"
        title="email"
      >
        {
          platform === 'ML' ? (
            <i className="cil-envelope-closed icon" />
          ) :
            (
              <i className="cil-address-book icon" />
            )
        }
      </div>
      <div className="ml-1">
        <p className="m-0 pl-1 account-detail">
          {
            platform === 'ML' ? (
              <>
                <span className="font-weight-bold text-muted d-block">E-mail: </span>
                {email}
              </>
            ) :
              (
                <>
                  <span className="font-weight-bold text-muted d-block">Status: </span>
                  {status}
                </>
              )
          }
        </p>
      </div>
    </div>
  );
}
