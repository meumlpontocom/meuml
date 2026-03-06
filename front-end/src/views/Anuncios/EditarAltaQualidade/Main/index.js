// React & Redux
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleIsLoading,
  saveAdvertData,
} from "../../../../redux/actions/_highQualityActions";
// Reactstrap
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import CardFooter from "reactstrap/lib/CardFooter";
// Components
import LoadPageHandler from "../../../../components/Loading";
import { updateHighQualityProperties } from "./fetchHighQualityAds";
import AdvertImgCarousel from "./AdvertImagesCarousel";
import AdvertTitle from "./AdvertTitle";
import AdvertDescription from "./AdvertDescription";
import AdvertGtin from "./AdvertGtin";
import ConfirmEdition from "./ConfirmEdition";
import PublishingErrors from "./PublishingErrors";
import CancelEdition from "./CancelEdition";

export default function EditToReachHighQuality({ history }) {
  const dispatch = useDispatch();
  const { isLoading, advertId, advertData } = useSelector(
    (state) => state.highQualityAdvert
  );

  const toggleLoading = () => dispatch(toggleIsLoading());
  function saveEditHighQualityPropsResponse(api_data) {
    dispatch(saveAdvertData(api_data));
  }

  useEffect(() => {
    if (!advertId) history.goBack();
    else
      (async function () {
        const response = await updateHighQualityProperties({
          advertisingId: advertId,
          toggleLoading,
        });

        saveEditHighQualityPropsResponse(response);
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <Col>
          <Card>
            <CardHeader>
              <h4 className="text-primary">Editar anúncio ({advertId})</h4>
            </CardHeader>
            <CardBody>
              <Row>
                <AdvertImgCarousel advertData={advertData} />
                <Col xs="12" sm="12" md="7" lg="7" xl="9">
                  <Row>
                    <AdvertTitle />
                    <AdvertDescription />
                    <AdvertGtin />
                    <PublishingErrors />
                  </Row>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <Row>
                <Col className="text-left">
                  <CancelEdition history={history} />
                </Col>
                <Col className="float-right">
                  <ConfirmEdition />
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
      }
    />
  );
}
