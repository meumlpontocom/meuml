import React from "react";

export default function FreeSubs({ accounts }) {
  return (
    <>
      <span className="badge badge-danger mr-2">Gratuito</span>
      {accounts.length !== 0
        ? accounts.map((subscription, index) => {
            return (
              <span key={index}>
                <small>
                  {subscription.accounts}
                  {index + 1 !== accounts.length ? ", " : null}
                </small>
              </span>
            );
          })
        : null}
    </>
  );
}
