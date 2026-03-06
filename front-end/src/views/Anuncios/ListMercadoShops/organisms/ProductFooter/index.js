import React                        from "react";
import { useDispatch, useSelector } from "react-redux";
import { CCardFooter }              from "@coreui/react";
import Pagination                   from "react-js-pagination";

import { getAProductsMshops }       from "../../requests";
import { clearProductsState }       from "../../../../../redux/actions/_mshopsActions";

export default function ProductFooter() {
  const dispatch = useDispatch();
  const { meta } = useSelector((state) => state.mshops);
  const fetchAndDispatch = (page) => {
    dispatch(clearProductsState());
    getAProductsMshops({ page, dispatch });
  };

  return (
    <>
      <CCardFooter className="d-flex justify-content-end">
        <Pagination
          onChange={(page) => fetchAndDispatch(page)}
          itemsCountPerPage={meta.limit}
          totalItemsCount={meta.total}
          activePage={meta.page}
          pageRangeDisplayed={5}
          innerClass="btn-group"
          activeLinkClass="text-white"
          activeClass="btn btn-md btn-info"
          itemClass="btn btn-md btn-outline-info"
        />
      </CCardFooter>
    </>
  );
}
