/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import LoadPageHandler from "../Loading";
import PositioningChart from "./PositioningChart";
import AdvertInformation from "./AdvertInformation";
import Button from "reactstrap/lib/Button";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import CardFooter from "reactstrap/lib/CardFooter";
import DetailsAndDescription from "./DetailsAndDescription";
import fetchAdPositionDetails from "./fetchAdPositionDetails";
import SearchAdvertByNameOrId from "./SearchAdvertByNameOrId";
import { Provider } from "./contex";

export default function AdvertPositionDetails({ history }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  let hrefId = window.location.href.split("posicionamento/")[1].toString();
  const handleFetchApi = async ({ id }) => {
    const dealWithResponse = ({ response }) => {
      if (response.data?.status === "success") {
        setDetails({ ...response.data.data });
        setLoading(false);
      } else {
        setLoading(false);
        Swal.fire({
          title: "Atenção",
          html: "<p>Você deve informar um <strong>ID válido.</strong></p>",
          type: "warning",
          showCloseButton: true,
        });
      }
    };
    setLoading(true);
    return fetchAdPositionDetails(id)
      .then(response => dealWithResponse({ response }))
      .catch(error =>
        Swal.fire({
          title: "Atenção",
          html: `<p>${error}<p>`,
          type: "error",
          showCloseButton: true,
        }),
      );
  };
  useEffect(() => {
    handleFetchApi({ id: hrefId });
    return function cleanup() {
      const controller = new AbortController();
      controller.abort();
    };
  }, []);
  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        <Provider value={{ handleFetchApi }}>
          <SearchAdvertByNameOrId id={hrefId} />
          <Card className="card-accent-primary">
            <CardHeader>
              <AdvertInformation advertId={hrefId} advertDetails={details} />
            </CardHeader>
            <CardBody>
              <PositioningChart advertDetails={details} />
              <DetailsAndDescription />
            </CardBody>
            <CardFooter>
              <Button color="secondary" onClick={() => history.goBack()}>
                <i className="cil-arrow-left mr-1" />
                Voltar
              </Button>
            </CardFooter>
          </Card>
        </Provider>
      }
    />
  );
}
