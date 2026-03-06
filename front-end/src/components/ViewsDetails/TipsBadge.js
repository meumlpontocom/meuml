import React from "react";

export default function TipsBadge({ children }) {
  return (
    <span>
      <div className="list-group-item list-group-item-accent-danger list-group-item-secondary">
        {children}
      </div>
    </span>
  );
}
