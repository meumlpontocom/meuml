import React, {useContext} from "react";
import {CCollapse} from "@coreui/react";
import Paused from "./Paused";
import AutomaticShippingTerm from "./AutomaticShippingTerm";
import vacationContext from "../vacationContext";

function VacationModes() {
  const {vacationMode} = useContext(vacationContext);
  return (
    <CCollapse show={vacationMode > 0}>
      {
        vacationMode === 1
          ? (
            <Paused/>
          )
          : vacationMode === 2
          ? (
            <AutomaticShippingTerm/>
          ) : (
            <></>
          )
      }
    </CCollapse>
  );
}

export default VacationModes;
