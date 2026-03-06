// React & Redux
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSelectAllAdsFromPage } from "../../../../../redux/actions/_catalogActions";
// Reactstrap
import Button from "reactstrap/lib/Button";

export default function SelectAllFromPage() {
  const dispatch = useDispatch();
  const {
    pagesSelected,
    meta: { page },
  } = useSelector((state) => state.catalog);

  const currentPageIsSelected = useMemo(() => {
    return pagesSelected.find((p) => p === page);
  }, [pagesSelected, page]);

  function toggleSelectPage() {
    dispatch(toggleSelectAllAdsFromPage());
  }

  return (
    <Button
      onClick={toggleSelectPage}
      color={currentPageIsSelected ? "danger" : "secondary"}
    >
      <i
        style={{ color: "#fff" }}
        className={`fa fa-${
          currentPageIsSelected ? "check-square" : "square"
        } mr-1`}
      />
      {currentPageIsSelected
        ? "Deselecionar Todos da Página"
        : "Selecionar Todos da Página"}
    </Button>
  );
}
