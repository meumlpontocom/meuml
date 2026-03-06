import React from "react";
import Button from "reactstrap/lib/Button";
import { useSelector, useDispatch } from "react-redux";

export default function SelectAllBtn() {
  const dispatch = useDispatch();
  const { selectAll } = useSelector(state => state.advertsReplication);
  function handleSelectAll() {
    dispatch({ type: "REPLICATION_TOGGLE_SELECT_ALL_ADS" });
  }
  return (
    <Button color={selectAll ? "danger" : "dark"} onClick={handleSelectAll}>
      <i className={`fa fa${selectAll ? "-check-" : "-"}square mr-1`} />
      {selectAll ? "Limpar seleção" : "Selecionar todos"}
    </Button>
  );
}
