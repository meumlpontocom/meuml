import React from "react";
import "./index.css";

export default function Title({ title, owner }) {
  return (
    <>
      <span className="advertising-title">
        {title}
      </span>
      <span className="advertising-owner">
        ({owner})
      </span>
      <br />
    </>
  );
}
