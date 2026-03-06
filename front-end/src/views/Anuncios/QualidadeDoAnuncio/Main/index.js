import React, { useState, useEffect } from "react";
import {
  saveAdvertsPositionGrid,
  clearAdvertsPositionGrid,
  saveAdvertsPositionGridUrl,
  saveAdvertsPositionGridPagination,
} from "../../../../redux/actions";
import Paginate from "./Pagination";
import SearchBar from "./SearchBar";
import LoadPageHandler from "../../../../components/Loading";
import AdvertQualityTable from "./Table";
import CallToAction from "../../../CallToAction";
import { fetchAdsPosition } from "./fetchAdsPosition";
import { useDispatch, useSelector } from "react-redux";
import checkForSubscription from "../../../../helpers/checkForSubsription";
import { Card, CardBody, Row, CardHeader, CardFooter, Col } from "reactstrap";
import AccountsDropdown from "src/components/AccountsDropdown";

export default function AdvertsQuality() {
  const dispatch = useDispatch();
  const selectedAccounts = useSelector(state => state.accounts.selectedAccounts);
  const { pagination, array } = useSelector(state => state.advertsPositionGrid);
  const informObjectLength = ({ objectKeys }) => {
    if (objectKeys.length === 1 && objectKeys[0] === "0") return 0;
    else return objectKeys.length;
  };
  const showingPage = () => {
    const meta = pagination;
    const objectKeys = Object.keys(array);
    const showing = informObjectLength({ objectKeys });
    const x = Number(meta.limit) * Number(meta.page);
    if (meta.page === 1 && array?.length > 1) {
      return `Exibindo de 1 a ${showing} de ${meta.total} anúncios.`;
    } else if (meta.page === meta.last_page && array?.length > 1) {
      return `Exibindo de ${meta.total - showing} a ${meta.total} de ${meta.total} anúncios.`;
    } else if (array?.length === 1) {
      return "Exibindo 1 de 1 anúncio.";
    } else if (array?.length === 0) {
      return null;
    } else return `Exibindo de ${x - showing} a ${x} de ${meta.total} anúncios.`;
  };

  const [loading, setLoading] = useState(true);
  const advertsPositionGrid = useSelector(state => state.advertsPositionGrid);
  const dispatchStringFilterAndFetch = string => {
    let updatedUrl;
    if (selectedAccounts?.length) {
      updatedUrl = `filter_account=${selectedAccounts.map(({ value }) => value)}`;
    }
    if (string) {
      if (!updatedUrl) updatedUrl = `filter_string=${string}`;
      else updatedUrl = `${updatedUrl}&filter_string=${string}`;
    }
    dispatch(saveAdvertsPositionGridUrl(updatedUrl));
    handleFetchApi({ url: updatedUrl });
  };

  const savePositionGrid = positionGrid => dispatch(saveAdvertsPositionGrid(positionGrid));

  const savePositionGridMeta = positionGridMeta =>
    dispatch(saveAdvertsPositionGridPagination(positionGridMeta));

  // If api return error show error else dispatch adsPositionGrid and stop loading
  const [userIsNotSub, setUserIsNotSub] = useState(false);
  const handleApiResponse = response => {
    switch (response.data.status) {
      case "error":
        if (response.statusText === "PAYMENT REQUIRED") {
          setUserIsNotSub(true);
        }
        // showUserError(response.data.message);
        setLoading(false);
        break;
      case "success":
        savePositionGrid(response.data.data);
        savePositionGridMeta({ ...response.data.meta });
        setLoading(false);

        break;
      default:
        setLoading(false);
        break;
    }
  };

  // Clear store | state then fetch api then handle response
  const handleFetchApi = ({ url }) => {
    setLoading(true);
    dispatch(clearAdvertsPositionGrid());
    fetchAdsPosition(url, 1)
      .then(response => handleApiResponse(response))
      .catch(error => {
        return error;
      });
  };

  useEffect(() => {
    checkForSubscription({ module: 7 })
      .then(boolean => {
        setUserIsNotSub(!boolean);
        setLoading(false);
        if (boolean) handleFetchApi({ url: "" });
      })
      .catch(error => error);
  }, []); // eslint-disable-line

  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        userIsNotSub ? (
          <CallToAction />
        ) : advertsPositionGrid.array.length === 0 && !loading ? (
          <h1>Nenhum anúncio encontrado</h1>
        ) : (
          <>
            <Card className="card-accent-primary">
              <CardHeader>
                <Row>
                  <Col xs="12" sm="12" md="6" style={{ paddingLeft: "0px" }}>
                    <AccountsDropdown platform="ML" multiple={true} placeholder="Selecionar conta(s)" />
                  </Col>
                  <SearchBar onSearch={input => dispatchStringFilterAndFetch(input)} />
                </Row>
                <Col sm="12" md="12" lg="12" xs="12">
                  <p className="text-right mt-4">
                    {showingPage() !== "Exibindo de NaN a undefined de undefined anúncios."
                      ? showingPage()
                      : null}
                  </p>
                </Col>
              </CardHeader>
              <CardBody>
                <AdvertQualityTable advertsPositionGrid={advertsPositionGrid.array} />
              </CardBody>
              <CardFooter>
                {advertsPositionGrid.array.length > 0 ? (
                  <Paginate callLoading={bool => setLoading(bool)} />
                ) : null}
              </CardFooter>
            </Card>
          </>
        )
      }
    />
  );
}
