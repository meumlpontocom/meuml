import React from 'react'
import { DropdownItem } from 'reactstrap'
import { useHistory } from "react-router-dom";

export default function CatalogCharts({ id, url, title, categoryId }) {
  const history = useHistory();
  function handleClick() {
    history.push({ pathname: "/tabela-medidas", state: { id, url, title, categoryId } });
  }
  return (
    <DropdownItem onClick={handleClick}>
      Tabela de medidas
    </DropdownItem>
  )
}
