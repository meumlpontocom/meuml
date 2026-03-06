import React from "react";
import Button from "reactstrap/lib/Button";
import Input from "reactstrap/lib/Input";
import { useDispatch, useSelector } from "react-redux";
import { toggleIsCardOpen } from "../../../redux/actions/_salesActions";

const SalesHeader = ({ toggleKey }) => {
  const {
    sale: { id, date_closed, account_id },
  } = useSelector(({ shopee: { sales } }) => sales[toggleKey]);
  const accountName = useSelector(
    ({ shopee }) => shopee.accounts[account_id]?.name
  );
  const dispatch = useDispatch();
  const toggle = () => dispatch(toggleIsCardOpen(toggleKey));

  const DatePtBr = () => {
    return (
      <u style={{ color: "var(--gray)", textDecoration: "none" }}>
        {new Date(date_closed).toLocaleDateString("pt-BR")}
      </u>
    );
  };

  const DateTime = () => {
    return (
      <u style={{ color: "var(--gray)", textDecoration: "none" }}>
        {new Date(date_closed).toLocaleTimeString("pt-BR")}
      </u>
    );
  };

  return (
    <div className="salescard-top p-2 rounded-top">
      <div className="ml-2 pl-3 d-flex flex-row flex-wrap">
        <Input type="checkbox" />
        <p className="d-inline text-primary ml-2 mb-0">
          <strong>{accountName}</strong>
        </p>
        <p
          className="d-inline text-muted ml-2 mb-0"
          style={{ fontWeight: "bolder" }}
        >
          #{id}
        </p>
        <p className="d-inline ml-2 tex-muted mb-0">
          <DatePtBr />
        </p>
        <p className="d-inline ml-2 tex-muted mb-0">
          <DateTime />
        </p>
        <Button
          className="ml-auto salescard-top-btn btn btn-secondary "
          onClick={() => toggle()}
          style={{ height: "21px", width: "116px" }}
        >
          <i className="cui cui-chevron-circle-down-alt mr-2" />
          Ver detalhes
        </Button>
      </div>
    </div>
  );
};

export default SalesHeader;
