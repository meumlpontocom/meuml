import React, { useContext } from "react";
import CardFooter from "reactstrap/lib/CardFooter";
import context from "../advertReplicationContext";
import Pagination from "react-js-pagination";

export default function AdvertsFooter() {
  const { submitSearch, meta } = useContext(context);

  function handlePageChange(page) {
    if (page !== meta.page) {
      window.scrollTo({ top: 0 });
      return submitSearch({ page });
    }
  }

  return !meta.total ? (
    <></>
  ) : (
    <CardFooter>
      <Pagination
        onChange={handlePageChange}
        itemsCountPerPage={meta.limit}
        totalItemsCount={meta.total}
        activePage={meta.page}
        pageRangeDisplayed={5}
        innerClass="btn-group"
        activeLinkClass="text-white"
        activeClass="btn btn-md btn-info"
        itemClass="btn btn-md btn-outline-info"
      />
    </CardFooter>
  );
}
