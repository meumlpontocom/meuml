/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import fetchQualityDetails from "./fetchQualityDetails";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import LoadPageHandler from "../../../../../components/Loading";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";

export default function Main({ history, state }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(store => store.qualityDetails);
  useEffect(() => {
    if (!state) history.goBack();
    else fetchQualityDetails({ dispatch, advertId: state.externalId, history });
    return () => {
      return state;
    };
  }, []);

  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        <Row>
          <Col xs="12" sm="12" md="12" lg="12" xl="12">
            <Card>
              <Header secureThumbnail={state.thumbnail} title={state.title} />
              <Body history={history} />
              <Footer />
            </Card>
          </Col>
        </Row>
      }
    />
  );
}
