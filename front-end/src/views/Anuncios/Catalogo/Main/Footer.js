import React from "react";
import { getAdverts } from "./requests";
import Pagination from "react-js-pagination";
import CardFooter from "reactstrap/lib/CardFooter";
import { useDispatch, useSelector } from "react-redux";
import { clearAdvertsState } from "../../../../redux/actions/_catalogActions";

export default function Footer() {
  const dispatch = useDispatch();
  const { meta } = useSelector((state) => state.catalog);
  const fetchAndDispatch = (page) => {
    dispatch(clearAdvertsState());
    getAdverts({ page, dispatch });
  };

  return (
    <>
      <CardFooter className="d-flex justify-content-end">
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
      </CardFooter>
    </>
  );
}
