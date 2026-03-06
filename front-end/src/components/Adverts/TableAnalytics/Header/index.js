import React from "react";
import { useSelector } from "react-redux";

const TableHeader = () => {
  const allChecked = useSelector((state) => state.selectedAdverts.allChecked);
  const pagesAllChecked = useSelector(
    (state) => state.selectedAdverts.pagesAllChecked
  );
  const checked = allChecked ? true : pagesAllChecked;
  return (
    <thead className="thead-light">
      <tr>
        <th>Marcar</th>
        <th>Descrição</th>
        <th>Pendências</th>
        <th>Valor</th>
        {/*<th>Opções</th>*/}
      </tr>
    </thead>
  );
};

export default TableHeader;
