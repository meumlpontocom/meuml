import React from "react";
import Pagination from "react-js-pagination";
import { useSelector, useDispatch } from "react-redux";
import { fetchSales } from "./requests";

const Paginate = () => {
  const dispatch = useDispatch();
  const { next_page, last_page, limit, total, page } = useSelector(
    (state) => state.sales.meta
  );

  const fetch = (page) => {
    if (last_page > next_page) fetchSales({ dispatch, page });
  };

  return (
    <Pagination
      onChange={fetch}
      itemsCountPerPage={limit}
      totalItemsCount={total}
      activePage={page}
      pageRangeDisplayed={5}
      innerClass="btn-group"
      activeLinkClass="text-white"
      activeClass="btn btn-md btn-info"
      itemClass="btn btn-md btn-outline-info"
    />
  );
};

export default Paginate;
