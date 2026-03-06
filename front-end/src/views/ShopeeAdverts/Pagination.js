import React, { useRef } from "react";
import Pagination from "react-js-pagination";
import { useDispatch, useSelector } from "react-redux";
import fetchShopeeAdverts from "./requests";
import { CButton } from "@coreui/react";

export default function CustomPagination() {
  const dispatch = useDispatch();
  const { pagination, filters } = useSelector(({ shopee }) => shopee.advertising);
  const meta = useSelector(state => state.advertsReplication?.meta);

  const selectedAccounts = useSelector(({ shopee }) => Object.values(shopee.advertising.selectedAccounts));

  const currentPage = pagination.page ?? 1;
  const pageInputRef = useRef(currentPage);

  function handlePageChange(page) {
    if (page !== meta.page) {
      window.scrollTo({ top: 0 });

      fetchShopeeAdverts({
        page,
        dispatch,
        selectedAccounts,
        filters,
      });
    }
  }

  function goToSpecificPage(e) {
    e.preventDefault();
    const newPage = pageInputRef.current.value;
    if (!newPage) return;

    handlePageChange(newPage);
  }

  return (
    <div>
      <Pagination
        onChange={page => handlePageChange(page)}
        itemsCountPerPage={50}
        totalItemsCount={pagination.total}
        activePage={pagination.page}
        pageRangeDisplayed={5}
        innerClass="btn-group"
        activeLinkClass="text-white"
        activeClass="btn btn-md btn-info"
        itemClass="btn btn-md btn-outline-info"
      />

      <form onSubmit={goToSpecificPage}>
        <label htmlFor="page-input">Digite a página para onde quer ir</label>

        <div style={{ display: "flex", gap: "5px" }}>
          <input
            id="page-input"
            ref={pageInputRef}
            defaultValue={currentPage}
            style={{ maxWidth: "30px" }}
            type="numeric"
          />
          <CButton color="primary" type="submit">
            Ir para página
          </CButton>
        </div>
      </form>
    </div>
  );
}
