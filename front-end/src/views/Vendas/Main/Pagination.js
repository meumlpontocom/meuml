import React from "react";
import Pagination from "react-js-pagination";
import { useSelector, useDispatch } from "react-redux";
import { fetchSales } from "./requests";

const Paginate = () => {
  const dispatch = useDispatch();
  const meta = useSelector((state) => state.sales.meta);
  const { limit, total, page, last_page, next_page } = meta;
  const fetch = (page) => {
    if (meta) {
      if (last_page > next_page) fetchSales({ dispatch, page });
    }
  };

  return (
    <Pagination
      onChange={fetch}
      itemsCountPerPage={limit}
      totalItemsCount={total}
      activePage={page}
      lastPageText="Última"
      firstPageText="Primeira"
      pageRangeDisplayed={5}
      innerClass="btn-group"
      activeLinkClass="text-white"
      activeClass="btn btn-md btn-info"
      itemClass="btn btn-md btn-outline-info"
    />
  );
};

export default Paginate;
