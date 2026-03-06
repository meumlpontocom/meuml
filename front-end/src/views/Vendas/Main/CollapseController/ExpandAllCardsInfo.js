import React from "react";
import { useDispatch } from "react-redux";
import { collapseAllCards } from "../../../../redux/actions/_salesActions";
import { CButton } from "@coreui/react";
export default function ExpandAllCardsInfo() {
  const dispatch = useDispatch();
  function expandAll() {
    dispatch(collapseAllCards(true));
  }
  return (
    <CButton onClick={expandAll} color="secondary" size="sm">
      <i className="cil-arrow-bottom mr-1 icon-fix" />
      Expandir todos
    </CButton>
  );
}
