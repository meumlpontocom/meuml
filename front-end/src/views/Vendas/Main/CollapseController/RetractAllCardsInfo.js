import { CButton } from "@coreui/react";
import React from "react";
import { useDispatch } from "react-redux";
import { collapseAllCards } from "../../../../redux/actions/_salesActions";

export default function RetractAllCardsInfo() {
  const dispatch = useDispatch();
  function retractAll() {
    dispatch(collapseAllCards(false));
  }
  return (
    <CButton onClick={retractAll} color="dark" size="sm">
      <i className="cil-arrow-top mr-1 icon-fix" />
      Recolher todos
    </CButton>
  );
}
