import { CCardHeader } from "@coreui/react";
import React from "react";

export default function CardHeader({ text = "" }) {
  return (
    <CCardHeader>
      <h4 className="text-info">{text}</h4>
    </CCardHeader>
  );
}
