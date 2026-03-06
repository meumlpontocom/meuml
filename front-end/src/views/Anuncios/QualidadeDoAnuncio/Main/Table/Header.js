import React from "react";

export default function TableHeader({ show }) {
  return show ? (
    <thead className="thead-light">
      <tr>
        <th></th>
        <th>Foto</th>
        <th>Detalhes</th>
        <th className="text-center">Qualidade</th>
        <th className="text-center">Opções</th>
      </tr>
    </thead>
  ) : (
    <></>
  );
}
