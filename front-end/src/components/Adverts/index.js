/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Loading from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardFooter, CardHeader, Col, Input, Row } from "reactstrap";
import Swal from "sweetalert2";
import {
  advertsURL,
  clearAdvertsState,
  clearFilterState,
  clearURLState,
  filterAdverts,
  saveAccounts,
  saveAdverts,
  saveAdvertsPagination,
  uncheckAllAdverts,
} from "../../redux/actions";
import { getToken } from "../../services/auth";
import ButtonComponent from "../ButtonComponent";
import ModalBtn from "../Tags/ModalBtn";
import { fetchAds } from "./fetchAds";
import AdvertsFilters from "./Filters";
import MassChangesBtn from "./MassChangesBtn";
import Paginate from "./Pagination";
import ReplicateAdsBtn from "./ReplicateAdsBtn";
import AdsTable from "./Table";
import UserProductWarning from "../UserProductWarning";

const Main = ({ history }) => {
  const dispatch = useDispatch();
  const adverts = useSelector(state => state.adverts);
  const [countState, setCountState] = useState(0);
  const url = useSelector(state => state.advertsURL);
  const meta = useSelector(state => state.advertsMeta);
  const [loading, setLoading] = useState(true);
  const [showing, setShowing] = useState(0);
  const [search, setSearch] = useState("");

  const selectedFilters = useSelector(state => state.advertsFilters);
  const { selectedTags } = useSelector(state => state.tags);

  const KEY_CODE_ENTER = 13;

  const advertsAmount = () => {
    let amount = 0;
    for (const ad in adverts) {
      if (adverts.hasOwnProperty(ad) && adverts[ad].id !== "noADVERTS") {
        amount++;
      }
    }

    return amount === 1
      ? ` 1 anúncio encontrado.`
      : amount === 0
      ? `Nenhum anúncio encontrado.`
      : `${amount} anúncios encontrados.`;
  };

  const _handleKeyDown = e => {
    if (e.keyCode === KEY_CODE_ENTER) {
      filterAdsByString();
    }
  };

  const fetch = useCallback(
    async (url, page) => {
      setLoading(true);
      try {
        const responseAds = await fetchAds({ url, page });
        dispatch(saveAdverts(responseAds.data.data));
        dispatch(saveAdvertsPagination(responseAds.data.meta));

        const responseAccount = await axios.get(
          `
    ${process.env.REACT_APP_API_URL}/accounts`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (responseAccount.status === 200 && responseAccount.data.meta.total > 0) {
          dispatch(saveAccounts(responseAccount.data.data));
        }
        return setLoading(false);
      } catch (error) {
        Swal.fire({
          title: "Atenção!",
          html: `<p>${error}</p>`,
          type: "error",
          showCloseButton: true,
        });
      } finally {
        setCountState(countState + 1);
      }
    },
    [countState, dispatch],
  );

  const isEmpty = object => {
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  };

  const filterAdsByString = () => {
    const urlSearch = url;
    const searchExists = urlSearch.search("filter_string");
    let newSearch = "";

    const entries = Object.entries(selectedFilters);

    let filterList = entries.map(objectEntry => {
      let filterString = [];

      const setFilter = filterName => {
        let filterValue = [];
        for (const key in objectEntry[1]) {
          filterValue.push(objectEntry[1][key].value);
        }
        filterString.push(`${filterName}=${filterValue}`);
      };

      if (!isEmpty(objectEntry[1])) {
        switch (objectEntry[0]) {
          case "accounts":
            setFilter("filter_account");
            break;

          case "status":
            setFilter("status");
            break;

          case "free_shipping":
            setFilter("free_shipping");
            break;

          case "sort_order":
            filterString.push(`sort_name=${objectEntry[1].value[0]}&sort_order=${objectEntry[1].value[1]}`);
            break;

          case "filter_string":
            filterString.push(`filter_string=${search.trimStart().trimEnd()}`);
            break;

          case "filter_tags_and_catalog":
            switch (objectEntry[1].value) {
              case 0:
                filterString.push(`filter_catalog=${objectEntry[1].value}`);
                break;
              case 1:
                filterString.push(`filter_catalog=${objectEntry[1].value}`);
                break;
              case 2:
                filterString.push(`filter_catalog=${objectEntry[1].value}`);
                break;
              default:
                filterString.push(`filter_tags=${objectEntry[1].value}`);
                break;
            }
            break;

          default:
            dispatch(advertsURL(""));
            break;
        }
      }

      return filterString[0];
    });

    if (selectedTags.length) filterList.push(`meuml_tags=${selectedTags.map(({ id }) => id)}`);
    const joinedFilterList = filterList.filter(x => x !== undefined).join("&");

    //Se já existir um termo de busca de string
    //irá substituí-lo pelo novo termo de busca
    if (searchExists !== -1) {
      newSearch = joinedFilterList
        .split("&")
        .map(item =>
          item.search("filter_string") !== -1 ? `filter_string=${search.trimStart().trimEnd()}` : item,
        )
        .join("&");
    } else {
      //Caso contrário, apenas concatenará o termo de busca à url previamente contruída
      newSearch = joinedFilterList
        ? joinedFilterList + `&filter_string=${search.trimStart().trimEnd()}`
        : `filter_string=${search.trimStart().trimEnd()}`;
    }

    dispatch(
      filterAdverts({
        filter_string: { label: "search", value: search.trimStart().trimEnd() },
      }),
    );
    dispatch(advertsURL(newSearch));
  };

  useEffect(() => {
    if (!history.location.state) {
      const initialFetch = async page => {
        setLoading(true);
        try {
          if (countState === 0) {
            dispatch(clearAdvertsState());
            dispatch(uncheckAllAdverts());
            dispatch(clearFilterState());
            dispatch(clearURLState());
          }

          const responseAds = await fetchAds({ url, page });

          dispatch(saveAdverts(responseAds.data.data));
          dispatch(saveAdvertsPagination(responseAds.data.meta));

          return setLoading(false);
        } catch (error) {
          Swal.fire({
            title: "Atenção!",
            html: `<p>${error}</p>`,
            type: "error",
            showCloseButton: true,
          });
        } finally {
          setCountState(countState + 1);
        }
      };

      initialFetch("page=1");
    }
    // return () => dispatch(clearAdvertsState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, url, history]);

  const showingPage = () => {
    const x = Number(meta.limit) * Number(meta.page);
    if (meta.page === 1) {
      return `Exibindo de 1 a ${showing} de ${meta.total} anúncios.`;
    } else if (meta.page === meta.last_page) {
      return `Exibindo de ${meta.total - showing} a ${meta.total} de ${meta.total} anúncios.`;
    }

    return `Exibindo de ${x - showing} a ${x} de ${meta.total} anúncios.`;
  };

  useEffect(() => {
    const routeState = history.location.state;
    routeState?.searchAdvertID && fetch(`filter_string=${routeState.searchAdvertID}`, "page=1");
  }, []);

  return (
    <>
      <UserProductWarning />
      <Card className="card-accent-primary">
        <CardBody>
          <AdvertsFilters savedURL={url} />
        </CardBody>
      </Card>
      {loading ? (
        <Row style={{ justifyContent: "center", marginTop: "200px" }}>
          <Col sm={{ size: "auto" }} md={{ size: "auto" }} lg={{ size: "auto" }} xs={{ size: "auto" }}>
            <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
          </Col>
        </Row>
      ) : (
        <Card id="table-card-responsive">
          <CardHeader>
            <Row>
              <Col sm="6" md="4" lg="4" xs="8" xl="4" className="mb-2">
                <Input
                  type="text"
                  value={search}
                  placeholder="Buscar anúncio"
                  title="Buscar por anúncio(s)"
                  onChange={event => setSearch(event.target.value)}
                  onKeyDown={event => _handleKeyDown(event)}
                />
              </Col>
              <Col xs="2" sm="6" md="2" lg="2" xl="2" className="mb-2">
                <ButtonComponent
                  onClick={() => filterAdsByString()}
                  title="Pesquisar"
                  icon="cil-search"
                  width="100%"
                />
              </Col>
              <Col xs="12" sm="6" md="6" lg="6" xl="3" className="mb-2">
                <ModalBtn />
              </Col>
              <Col xs="12" sm="6" md="4" lg="4" xl="3" className="mb-2">
                <MassChangesBtn history={history} />
              </Col>
              <Col xs="12" sm="6" md="6" lg="4" xl="4" className="mb-2">
                <ReplicateAdsBtn
                  type={"ml"}
                  title={"Replicar - Mercado Livre"}
                  history={history}
                  bgColor="#FEE600"
                  textColor="#383C77"
                />
              </Col>
              <Col xs="12" sm="6" md="6" lg="4" xl="4">
                <ReplicateAdsBtn
                  type={"shopee"}
                  title={"Replicar - Shopee"}
                  history={history}
                  bgColor="#EF5435"
                  textColor="#FFFFFF"
                />
              </Col>
            </Row>
          </CardHeader>
          <CardBody style={{ minHeight: "350px" }}>
            <span className="badge badge-success mb-1">
              {showing !== 0 ? showingPage() : advertsAmount()}
            </span>
            <AdsTable adsCount={number => setShowing(number)} />
          </CardBody>
          <CardFooter>
            <Paginate callLoading={bool => setLoading(bool)} loading={loading} />
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default Main;
