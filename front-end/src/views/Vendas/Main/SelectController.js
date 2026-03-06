import { CButtonGroup } from "@coreui/react";
import React from "react";
import SelectAllSalesBtn from "./SelectAllSalesBtn";
import UnselectAllSalesBtn from "./UnselectAllSalesBtn";

export default function SelectController() {
  return (
    <div className="mr-2">
      <CButtonGroup>
        <SelectAllSalesBtn />
        <UnselectAllSalesBtn />
      </CButtonGroup>
    </div>
  );
}
