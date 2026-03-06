// React & Redux
import React                        from "react";
import { useDispatch, useSelector } from "react-redux";
import { CButton }                  from "@coreui/react";

import { toggleSelectAllAds }       from "../../../../../redux/actions/_mshopsActions";


export default function SelectAll() {
  const dispatch = useDispatch();
  const { allProductsSelected } = useSelector((state) => state.mshops);

  function toggleSelectAll() {
    dispatch(toggleSelectAllAds());
  }

  return (
    <CButton
      onClick={toggleSelectAll}
      color={allProductsSelected ? "danger" : "dark"}
    >
      <i
        className={`fa fa-${
          allProductsSelected ? "check-square" : "square"
        } mr-1`}
      />
      {allProductsSelected ? "Deselecionar Todos" : "Selecionar Todos"}
    </CButton>
  );
}
