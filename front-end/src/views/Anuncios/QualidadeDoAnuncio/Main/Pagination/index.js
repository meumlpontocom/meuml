import React /*, {useEffect}*/ from "react";
import Swal from "sweetalert2";
import { fetchAdsPosition } from "../fetchAdsPosition";
import Pagination from "react-js-pagination";
import { useSelector, useDispatch } from "react-redux";
import {
  saveAdvertsPositionGrid,
  clearAdvertsPositionGrid,
  saveAdvertsPositionGridPagination
} from "../../../../../redux/actions";

const Paginate = ({ callLoading }) => {
  const advertsPositionGrid = useSelector(state => state.advertsPositionGrid);

  const dispatch = useDispatch();

  const fetchAndDispatch = page => {
    callLoading(true);
    dispatch(clearAdvertsPositionGrid());
    fetchAdsPosition(advertsPositionGrid.url, page)
      .then(response => {
        dispatch(saveAdvertsPositionGrid(response.data.data));
        dispatch(saveAdvertsPositionGridPagination(response.data.meta));
        callLoading(false);
      })
      .catch(error => {
        callLoading(false);
        Swal.fire({
          title: "Atenção!",
          html: `<p>${error}</p>`,
          type: "error",
          showCloseButton: true
        });
      });
  };

  return (
    <Pagination
      onChange={page => fetchAndDispatch(page)}
      itemsCountPerPage={advertsPositionGrid.pagination?.limit}
      totalItemsCount={advertsPositionGrid.pagination?.total}
      activePage={advertsPositionGrid.pagination?.page}
      pageRangeDisplayed={5}
      innerClass="btn-group"
      activeLinkClass="text-white"
      activeClass="btn btn-md btn-info"
      itemClass="btn btn-md btn-outline-info"
    />
  );
};

export default Paginate;
