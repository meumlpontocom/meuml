import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAccount } from "../../../../../redux/actions/_catalogActions";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import CardHeader from "reactstrap/lib/CardHeader";
import ButtonGroup from "reactstrap/lib/ButtonGroup";
import SelectAccounts from "../../../../../components/SelectAccounts";
import { getAdverts } from "../requests";
import CatalogFilter from "../CatalogFilter";
import {
  saveAdvertsFilter,
  setPriceToWinFilter,
  setTagsFilter,
} from "../../../../../redux/actions/_catalogActions";
import SelectAllFromPage from "./SelectAllFromPage";
import SelectAll from "./SelectAll";
import ButtonComponent from "src/components/ButtonComponent";

export default function Header() {
  const dispatch = useDispatch();
  const tagsFilter = useSelector(state => state.catalog.tagsFilter);
  const advertising = useSelector(state => state.catalog.advertising);
  const catalogFilter = useSelector(state => state.catalog.catalogFilter);
  const priceToWinFilter = useSelector(state => state.catalog.priceToWinFilter);
  const selectedAccounts = useSelector(state => state.catalog.selectedAccounts);
  const { first_page, last_page, limit, page, total } = useSelector(state => state.catalog.meta);
  const setFilter = selected => {
    if (Number(selected.value) >= 0) {
      dispatch(saveAdvertsFilter(selected));
      dispatch(setTagsFilter(""));
    } else {
      dispatch(setTagsFilter(selected));
      dispatch(saveAdvertsFilter(""));
    }
  };
  const catalogFilters = [
    { label: "Boost de Catálogo", value: "catalog_boost" },
    { label: "Inelegível para o Catálogo", value: 0 },
    { label: "Elegível para o Catálogo", value: 1 },
    { label: "Pertence ao Catálogo", value: 2 },
  ];
  const priceToWinFilters = [
    { label: "Vencedor", value: "winning" },
    { label: "Competindo", value: "competing" },
    { label: "Listado", value: "listed" },
    { label: "Compartilhando primeiro lugar", value: "sharing_first_place" },
  ];

  const filters = useMemo(() => {
    let f = "";
    if (catalogFilter) f = `filter_catalog=${catalogFilter.value}`;
    if (priceToWinFilter) {
      if (!f) f = `filter_price_to_win=${priceToWinFilter.value}`;
      else f = `${f}&filter_price_to_win=${priceToWinFilter.value}`;
    }
    if (tagsFilter) {
      if (!f) f = `filter_tags=${tagsFilter.value}`;
      else f = `${f}&filter_tags=${tagsFilter.value}`;
    }
    if (selectedAccounts.length) {
      if (!f) f = `filter_account=${selectedAccounts.map(acc => acc.id)}`;
      else f = `${f}&filter_account=${selectedAccounts.map(acc => acc.id)}`;
    }

    return f;
  }, [catalogFilter, priceToWinFilter, selectedAccounts, tagsFilter]);

  function dispatchBestPriceFilters(value) {
    dispatch(setPriceToWinFilter(value));
  }

  function dispatchSelectedAccounts(value) {
    dispatch(selectAccount(value));
  }

  function filterByAccounts() {
    getAdverts({ dispatch, filters, page: first_page });
  }

  function clearSelection() {
    dispatch(selectAccount([]));
    dispatch(setTagsFilter(null));
    dispatch(saveAdvertsFilter(null));
    dispatch(setPriceToWinFilter(null));
  }

  const showingPage = () => {
    const x = Number(limit) * Number(page);
    var ads = Object.keys(advertising);

    if (ads.length === 0) {
      return "Nenhum anúncio encontrado.";
    } else if (ads.length < limit) {
      return `Exibindo de 1 a ${total} de ${total} anúncios.`;
    } else if (page === 1) {
      return `Exibindo de 1 a ${limit} de ${total} anúncios.`;
    } else if (page === last_page) {
      return `Exibindo de ${total - limit} a ${total} de ${total} anúncios.`;
    }

    return `Exibindo de ${x - limit} a ${x} de ${total} anúncios.`;
  };
  return (
    <CardHeader>
      <Row name="filter-row" id="filters-row">
        <Col xs="12" sm="6" md="4" lg="4" xl="4">
          <SelectAccounts
            callback={dispatchSelectedAccounts}
            selected={selectedAccounts}
            placeholder="Filtrar por conta(s)"
          />
        </Col>
        <Col className="mb-1" xs="12" sm="6" md="6" lg="4" xl="4">
          <CatalogFilter
            options={catalogFilters}
            setSelected={setFilter}
            catalogFilter={catalogFilter || tagsFilter}
          />
        </Col>
        <Col className="mb-1" xs="12" sm="6" md="6" lg="4" xl="4">
          <CatalogFilter
            options={priceToWinFilters}
            catalogFilter={priceToWinFilter}
            setSelected={dispatchBestPriceFilters}
          />
        </Col>
        <Col className="d-flex justify-content-start mb-5 mt-2">
          <ButtonComponent title="Filtrar" icon="cil-filter" onClick={filterByAccounts} variant="" />
          <ButtonComponent
            title="Limpar"
            icon="cil-clear-all"
            onClick={clearSelection}
            color="dark"
            className="ml-3"
          />
        </Col>
      </Row>
      <span className="badge badge-success p-2 ml-1 mt-1">{showingPage()}</span>
      {Object.keys(advertising).length ? (
        <Row className="mt-2">
          <Col
            style={{
              padding: "0px 0px 0px 18px",
              maxWidth: "393px",
              marginBottom: "14px",
            }}
            xs={12}
            sm={6}
            md={6}
            lg={6}
          >
            <ButtonGroup>
              <SelectAllFromPage />
              <SelectAll />
            </ButtonGroup>
          </Col>
          {/* <Col
            xs={6}
            sm={4}
            md={4}
            lg={4}
            style={{
              padding: "0px 0px 0px 18px",
              maxWidth: "200px",
              marginBottom: "20px",
            }}
          >
            <BulkOptions />
          </Col> */}
        </Row>
      ) : (
        <></>
      )}
    </CardHeader>
  );
}
