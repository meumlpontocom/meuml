import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "./advertReplicationContext";
import AdvertsHeader from "./AdvertsHeader";
import AdvertsBody from "./AdvertsBody";
import AdvertsFooter from "./AdvertsFooter";
import Card from "reactstrap/lib/Card";
import fetchAdverts from "./fetchAdverts";
import "./index.css";
import AdvertFilters from "./AdvertFilters";
import {
  REPLICATION_SET_QUERY_CATEGORY,
  REPLICATION_SET_QUERY_KEYWORD,
  REPLICATION_SET_QUERY_NICKNAME,
} from "src/redux/actions/action-types";
import { CCard } from "@coreui/react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

export default function Main() {
  const dispatch = useDispatch();

  const isLoading = useSelector(state => state.advertsReplication?.isLoading);
  const meta = useSelector(state => state.advertsReplication?.meta);
  const adverts = useSelector(state => state.advertsReplication?.adverts);
  const url = useSelector(state => state.advertsReplication?.url);
  const selectAll = useSelector(state => state.advertsReplication?.selectAll);
  const selectedAdverts = useSelector(state => state.advertsReplication?.selectedAdverts);

  const {
    pagesSelected,
    meta: { page },
  } = useSelector(state => state.advertsReplication);

  const pageIsSelected = useMemo(() => {
    return pagesSelected.includes(page);
  }, [pagesSelected, page]);

  const goToAdverts = () => dispatch({ type: "REPLICATION_GO_TO_ADVERTS" });
  const checkAdvert = payload => dispatch({ type: "REPLICATION_SELECT_ADVERT", payload });
  const toggleIsLoading = () => dispatch({ type: "REPLICATION_TOGGLE_LOADING" });

  const nickname = useSelector(state => state.advertsReplication?.queryParams?.nickname);
  const keyword = useSelector(state => state.advertsReplication?.queryParams?.keyword);
  const category = useSelector(state => state.advertsReplication?.queryParams?.category);

  const setKeyword = useCallback(
    payload => dispatch({ type: REPLICATION_SET_QUERY_KEYWORD, payload }),
    [dispatch],
  );
  const setNickname = useCallback(
    payload => dispatch({ type: REPLICATION_SET_QUERY_NICKNAME, payload }),
    [dispatch],
  );
  const setCategory = useCallback(
    payload => dispatch({ type: REPLICATION_SET_QUERY_CATEGORY, payload }),
    [dispatch],
  );

  const disableBtn = useMemo(() => !keyword & !nickname & !category, [keyword, nickname, category]);

  async function submitSearch({ page = 1 }) {
    if (!disableBtn) {
      if (selectAll) dispatch({ type: "REPLICATION_TOGGLE_SELECT_ALL_ADS" });
      if (pageIsSelected) dispatch({ type: "REPLICATION_UNSELECT_ALL_FROM_PAGE" });

      await fetchAdverts({
        toggleIsLoading,
        dispatch,
        page,
        url,
        nickname,
        keyword,
        category: category?.id,
      });
    }
  }

  useEffect(() => {
    Swal.fire({
      title: "Função desabilitada pelo Mercado Livre",
      type: "error",
      html: `<div> Essa função foi desabilitada pelo Mercado Livre </div>`,
    });
  }, []);

  return (
    <Provider
      value={{
        goToAdverts,
        selectedAdverts,
        selectAll,
        setKeyword,
        setNickname,
        setCategory,
        checkAdvert,
        adverts,
        meta,
        isLoading,
        toggleIsLoading,
        submitSearch,
        keyword,
        nickname,
        category,
      }}
    >
      <CCard style={{ border: "2px solid #ffe900", backgroundColor: "#fffee0", padding: "10px 20px" }}>
        <h1> Função desabilitada pelo Mercado Livre </h1>
        <div style={{ fontSize: "22px" }}>
          <p>
            Não é mais possível replicar anúncios <b>de concorrentes</b>.
          </p>

          <p>
            Para replicar <b>anúncios próprios</b>, acesse a{" "}
            <Link style={{ color: "blue" }} to="/anuncios">
              página de anúncios do Mercado livre.
            </Link>
          </p>
        </div>
      </CCard>

      <Card className="card-accent-primary">
        <AdvertFilters />
      </Card>
      <Card className="table-card-responsive">
        <AdvertsHeader />
        <AdvertsBody />
        <AdvertsFooter />
      </Card>
    </Provider>
  );
}
