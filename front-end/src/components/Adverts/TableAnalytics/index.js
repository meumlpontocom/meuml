import React, { useEffect } from "react";
import { Table, Row, Col } from "reactstrap";
import TableHeader from "./Header";
import TableBody from "./Body";
import { useSelector } from "react-redux";

import { useMemo } from "react";
import "./styles.scss";

function AdsTableAnalytics({ adsCount }) {
  const advertising = useSelector(state => state.adverts);

  const obj = useMemo(() => {
    return { ...advertising };
  }, [advertising]);
  const objLength = Object.keys(obj);

  useEffect(() => {
    const informObjectLength = () => {
      if (objLength.length === 1 && objLength[0] === "0") return 0;
      else return objLength.length;
    };

    const adsCounter = adsCount(informObjectLength());
    return () => `adsCounter: ${adsCounter}`;
  }, [adsCount, objLength]);

  if (advertising[0].id === "noADVERTS") {
    return <p className="text-center">Você não possui anúncios</p>;
  }

  return (
    <Row>
      <Col sm="12" md="12" lg="12" xs="12">
        <Table className="table table-sm" style={{ minHeight: "121px" }}>
          <TableHeader />
          <TableBody adverts={Object.values(advertising)} />
        </Table>
      </Col>
    </Row>
  );
}

export default AdsTableAnalytics;
