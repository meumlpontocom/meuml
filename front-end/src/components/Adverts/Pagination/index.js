import { useEffect, useMemo, useRef } from "react";
import Pagination from "react-js-pagination";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import Swal from "sweetalert2";
import { clearAdvertsState, saveAdverts, saveAdvertsPagination } from "../../../redux/actions";
import { fetchAds } from "../fetchAds";
import { CButton } from "@coreui/react";

const Paginate = ({ callLoading, loading }) => {
  const meta = useSelector(state => state.advertsMeta);
  const url = useSelector(state => state.advertsURL);
  const history = useHistory();
  const { search } = useLocation();
  const dispatch = useDispatch();

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const currentPage = meta.page ?? 1;
  const currentPageParams = searchParams.get("page") ? Number(searchParams.get("page")) : null;
  const pageInputRef = useRef(currentPage);

  function setPageParam(page) {
    searchParams.set("page", page);
    history.replace({ search: searchParams.toString() });
  }

  const fetchAndDispatch = page => {
    callLoading(true);
    dispatch(clearAdvertsState());
    fetchAds({ url, page })
      .then(response => {
        dispatch(saveAdverts(response.data.data));
        dispatch(saveAdvertsPagination(response.data.meta));
        callLoading(false);
      })
      .catch(error => {
        callLoading(false);
        Swal.fire({
          title: "Atenção!",
          html: `<p>${error}</p>`,
          type: "error",
          showCloseButton: true,
        });
      });
  };

  function handleChangePage(page) {
    if (page !== meta.page) {
      window.scrollTo({ top: 0 });
      setPageParam(page);
      fetchAndDispatch(`page=${page}`);
    }
  }

  function goToSpecificPage(e) {
    e.preventDefault();
    const newPage = pageInputRef.current.value;
    if (!newPage) return;

    handleChangePage(newPage);
  }

  useEffect(() => {
    // Don't trigger page change if there are no ads (prevents infinite recursion)
    if (meta.total === 0) return;

    if (currentPageParams && Number(currentPageParams) !== meta.page && !loading) {
      handleChangePage(currentPageParams);
    }

    if (!currentPageParams) {
      setPageParam(1);
    }
  }, [currentPageParams, meta.page, meta.total, loading]);

  return (
    <div>
      <Pagination
        onChange={page => handleChangePage(page)}
        itemsCountPerPage={meta.limit}
        totalItemsCount={meta.total}
        activePage={meta.page}
        pageRangeDisplayed={5}
        innerClass="btn-group"
        activeLinkClass="text-white"
        activeClass="btn btn-md btn-info"
        itemClass="btn btn-md btn-outline-info "
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
};

export default Paginate;
