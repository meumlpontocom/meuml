import { CCol } from "@coreui/react";
import React    from "react";


export default function Table({
  children,
  variant,
  tableHeader,
  size,
  striped
}) {
  const TableHeader = () => tableHeader;
  return (
    <CCol xs={12} style={{ paddingLeft: "0px", paddingRight: "0px" }}>
      <table
        className={`table ${striped && "table-striped"} ${
          size && `table-${size}`
        }`}
      >
        <thead className={variant && `table-${variant}`}>
          <TableHeader />
        </thead>
        <tbody>{children}</tbody>
      </table>
    </CCol>
  );
}
