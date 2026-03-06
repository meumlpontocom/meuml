// React & Redux
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSelectAllAds } from "../../../../../redux/actions/_catalogActions";
// Reactstrap
import Button from "reactstrap/lib/Button";

export default function SelectAll() {
  const dispatch = useDispatch();
  const { allAdvertisingSelected } = useSelector((state) => state.catalog);

  function toggleSelectAll() {
    dispatch(toggleSelectAllAds());
  }

  return (
    <Button
      onClick={toggleSelectAll}
      color={allAdvertisingSelected ? "danger" : "dark"}
    >
      <i
        className={`fa fa-${
          allAdvertisingSelected ? "check-square" : "square"
        } mr-1`}
      />
      {allAdvertisingSelected ? "Deselecionar Todos" : "Selecionar Todos"}
    </Button>
  );
}
