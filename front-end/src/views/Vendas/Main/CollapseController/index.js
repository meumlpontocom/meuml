import { CButtonGroup } from "@coreui/react";
import React from "react";
import RetractAllCardsInfo from "./RetractAllCardsInfo";
import ExpandAllCardsInfo from "./ExpandAllCardsInfo";

export default function CollapseController() {
  return (
    <div>
      <CButtonGroup className="mt-2 mt-md-0">
        <ExpandAllCardsInfo />
        <RetractAllCardsInfo />
      </CButtonGroup>
    </div>
  );
}
