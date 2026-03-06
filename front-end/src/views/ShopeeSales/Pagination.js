import React from "react";
import Pagination from "react-js-pagination";
import { useSelector, useDispatch } from "react-redux";
import { fetchSales } from "./requests";

const Paginate = () => {
  const dispatch = useDispatch();
  const meta = useSelector(({ shopee }) => shopee.sales.pagination);

  const fetch = (page) => {
    if (meta) {
      if (meta.last_page > meta.next_page) fetchSales({ dispatch, page });
    }
  };

  return (
    <Pagination
      onChange={fetch}
      itemsCountPerPage={meta?.limit}
      totalItemsCount={meta?.total}
      activePage={meta?.page}
      pageRangeDisplayed={5}
      innerClass="btn-group"
      activeLinkClass="text-white"
      activeClass="btn btn-md btn-info"
      itemClass="btn btn-md btn-outline-info"
    />
  );
};

export default Paginate;
