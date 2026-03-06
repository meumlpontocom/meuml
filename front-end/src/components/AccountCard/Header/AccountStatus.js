import React from "react";
import { useSelector } from "react-redux";

const AccountStatus = ({ id }) => {
  const status = useSelector(
    ({ accounts: { accounts } }) => accounts[id]?.internal_status
  );
  return (
    <div className="account-status" status={status}>
      {status ? (
        <i
          style={{ color: "green" }}
          className="fa fa-circle"
          title="Sua conta está ativa."
        />
      ) : (
        <i
          style={{ color: "red" }}
          className="fa fa-circle"
          title="Sua conta precisa ser removida e adicionada novamente."
        />
      )}
    </div>
  );
};

export default AccountStatus;
