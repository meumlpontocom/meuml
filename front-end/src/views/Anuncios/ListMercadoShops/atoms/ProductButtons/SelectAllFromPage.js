import React, { useMemo }             from "react";
import { useDispatch, useSelector }   from "react-redux";
import { CButton }                    from "@coreui/react";

import { toggleSelectAllAdsFromPage } from "../../../../../redux/actions/_mshopsActions";


export default function SelectAllFromPage() {
  const dispatch = useDispatch();
  const {
    pagesSelected,
    meta: { page },
  } = useSelector((state) => state.mshops);

  const currentPageIsSelected = useMemo(() => {
    return pagesSelected.find((p) => p === page);
  }, [pagesSelected, page]);

  function toggleSelectPage() {
    dispatch(toggleSelectAllAdsFromPage());
  }

  return (
    <CButton
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
    </CButton>
  );
}
