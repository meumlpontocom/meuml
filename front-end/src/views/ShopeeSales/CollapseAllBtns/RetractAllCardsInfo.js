// React & Redux
import React from "react";
import { useDispatch } from "react-redux";
import { retractAllCards } from "../../../../redux/actions/_salesActions";
import Button from "reactstrap/lib/Button";

export default function RetractAllCardsInfo() {
  const dispatch = useDispatch();
  function retractAll() {
    dispatch(retractAllCards());
  }
  return (
    <div className="ml-2" onClick={retractAll}>
      <Button color="warning" size="sm">
        <i className="cui cui-arrow-top mr-1" />
        Recolher todos
      </Button>
    </div>
  );
}
