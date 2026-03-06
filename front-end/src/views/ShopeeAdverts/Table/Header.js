import React from "react";
import { FaCheckSquare } from "react-icons/fa"

export default function Header() {
  return (
    <thead className="thead-light">
      <th>
        <FaCheckSquare />
      </th>
      <th>Capa</th>
      <th>Detalhes</th>
      <th></th>
    </thead>
  );
}
