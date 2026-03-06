import React from "react";
import { useDispatch } from "react-redux";
import { expandAllCards } from "../../../../redux/actions/_salesActions";
import Button from "reactstrap/lib/Button";

export default function ExpandAllCardsInfo() {
  const dispatch = useDispatch();
  function expandAll() {
    dispatch(expandAllCards());
  }
  return (
    <div onClick={expandAll}>
      <Button color="success" size="sm">
        <i className="cui cui-arrow-bottom mr-1" />
        Expandir todos
      </Button>
    </div>
  );
}
