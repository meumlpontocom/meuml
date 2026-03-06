import React from "react";
import { useSelector } from "react-redux";
import Card from "reactstrap/lib/Card";

export default function NoAuthenticationCard({ id }) {
  const status = useSelector(
    ({ accounts: { accounts } }) => accounts[id]?.internal_status
  );
  return !status ? (
    <Card
      className="my-0 mx-auto text-center d-flex align-items-center w-75"
      color="danger"
    >
      <p className="text-white my-0">
        <span className="d-block font-weight-bold">
          Esta conta perdeu autenticação.
        </span>
        Por favor, exclua esta conta e adicione novamente.
      </p>
    </Card>
  ) : (
    <></>
  );
}
