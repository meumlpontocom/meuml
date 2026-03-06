import React from "react";

export default function TableBody({ children }) {
  return (
    <tbody id="table-body" name="table-body" className="table-card-responsive">
      {children}
    </tbody>
  );
}
