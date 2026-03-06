import React from "react";
import Pagination from "react-js-pagination";

export default function PageChange({ changePage, limit, total, page }) {
  return (
    <Pagination
      activePage={page}
      onChange={changePage}
      innerClass="btn-group"
      pageRangeDisplayed={5}
      totalItemsCount={total}
      itemsCountPerPage={limit}
      activeLinkClass="text-white"
      activeClass="btn btn-md btn-info"
      itemClass="btn btn-md btn-outline-info"
    />
  );
}
