import React from "react";
import { CPagination } from "@coreui/react";
import { RegisteredProductsContext } from "../RegisteredProductsContext";

export default function Pagination() {
  const { getProducts, filterString, selectedSortingOption, pagination } =
    React.useContext(RegisteredProductsContext);

  const paginationMemo = React.useMemo(
    () => ({ ...pagination, pages: pagination.pages - 1 }),
    [pagination]
  );

  function handlePageChange(page) {
    if (page !== paginationMemo.page) {
      getProducts(filterString, page, selectedSortingOption);
    }
  }

  return paginationMemo.pages > 0 ? (
    <CPagination
      pages={paginationMemo.pages}
      activePage={paginationMemo.page}
      onActivePageChange={handlePageChange}
    />
  ) : (
    <></>
  );
}
