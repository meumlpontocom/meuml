import React from "react";
import NoSubscriptionAtThisCategory from "../NoSubscriptionAtThisCategory";

export default function CustomSubs({ accounts }) {
  return (
    <>
      <span className="badge badge-primary mr-2">Personalizado</span>
      {accounts.length !== 0 ? (
        accounts.map((subscription, index) => {
          return (
            <span key={index}>
              <small>
                {subscription.accounts}
                {index + 1 !== accounts.length ? ", " : null}
              </small>
            </span>
          );
        })
      ) : (
        <NoSubscriptionAtThisCategory />
      )}
    </>
  );
}
