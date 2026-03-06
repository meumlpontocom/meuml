import React, { useMemo } from "react";
import Button from "reactstrap/lib/Button";
import { useDispatch, useSelector } from "react-redux";

const SelectAllFromPageBtn = () => {
  const dispatch = useDispatch();
  const {
    pagesSelected,
    meta: { page },
  } = useSelector(state => state.advertsReplication);

  const pageIsSelected = useMemo(() => {
    return pagesSelected.includes(page);
  }, [pagesSelected, page]);

  const selectAllFromPage = () => {
    pageIsSelected
      ? dispatch({ type: "REPLICATION_UNSELECT_ALL_FROM_PAGE" })
      : dispatch({ type: "REPLICATION_SELECT_ALL_FROM_PAGE" });
  };

  return (
    <Button color={pageIsSelected ? "danger" : "secondary"} onClick={() => selectAllFromPage()}>
      <i style={{ color: "#fff" }} className={`fa fa${!pageIsSelected ? "" : "-check"}-square mr-1`} />
      {pageIsSelected ? "Deselecionar Todos da Página" : "Selecionar Todos da Página"}
    </Button>
  );
};

export default SelectAllFromPageBtn;
