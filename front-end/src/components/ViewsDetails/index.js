import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import LoadPageHandler from "../Loading";
import AdvertInformation from "./AdvertInformation";
import { Card, CardHeader, CardBody } from "reactstrap";
import DetailsAndDescription from "./DetailsAndDescription";
import fetchAdViewsByDate from "./fetchAdViewsByDate";
import SearchAdByDate from "./SearchAdByDate";
import { Provider } from "./contex";
import ViewsChart from "./ViewsChart";

const ViewsDetails = (props) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  let hrefId = window.location.href
    .split("historico-de-visitas/")[1]
    .toString();
  let dateTo = new Date().toISOString().split("T", 1)[0];
  let dateFrom = new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .split("T", 1)[0];

  const handleFetchApi = async ({ id, dateTo, dateFrom }) => {
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

    return fetchAdViewsByDate(id, dateFrom, dateTo)
      .then((response) => dealWithResponse({ response }))
      .catch((error) =>
        Swal.fire({
          title: "Atenção",
          html: `<p>${error}<p>`,
          type: "error",
          showCloseButton: true,
        })
      );
  };
  useEffect(() => {
    handleFetchApi({ id: hrefId, dateTo, dateFrom });
    return function cleanup() {
      const controller = new AbortController();
      controller.abort();
    };
  }, [dateFrom, dateTo, hrefId]);
  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        <Provider value={{ handleFetchApi }}>
          <SearchAdByDate id={hrefId} />
          <Card className="card-accent-primary">
            <CardHeader>
              <AdvertInformation advertId={hrefId} advertDetails={details} />
            </CardHeader>
            <CardBody>
              <ViewsChart advertDetails={details} />
              <DetailsAndDescription />
            </CardBody>
          </Card>
        </Provider>
      }
    />
  );
};

export default ViewsDetails;
