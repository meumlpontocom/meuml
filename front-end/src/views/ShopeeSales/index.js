// React & Redux
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// Reactstrap
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Collapse from "reactstrap/lib/Collapse";
import Card from "reactstrap/lib/Card";
import CardBody from "reactstrap/lib/CardBody";
import CardFooter from "reactstrap/lib/CardFooter";
// Custom Components & CSS
import "./index.scss";
import FilterStringInput from "./FilterStringInput";
import SalesHeader from "./SalesHeader";
import SalesDefault from "./SalesDefault";
import SalesComplete from "./SalesComplete";
import ExpandAllCardsInfo from "./CollapseAllBtns/ExpandAllCardsInfo";
import RetractAllCardsInfo from "./CollapseAllBtns/RetractAllCardsInfo";
import FilterByAccount from "./FilterByAccount";
import { fetchSales } from "./requests";
import LoadPageHandler from "../../../components/Loading";
import Paginate from "./Pagination";

const Main = ({ history }) => {
  const dispatch = useDispatch();
  const { isCardOpen, sales, isLoading, selectedAccounts } = useSelector(
    ({ shopee: { sales } }) => sales
  );

  useEffect(() => {
    fetchSales({
      dispatch,
      selectedAccounts,
      filterStatus: ["manufacturing", "label_ready", "recent_orders"],
    });
    return () => sales;
  }, []); //eslint-disable-line

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <>
          <Col sm="12">
            <Card>
              <CardBody>
                <h5 className="text-primary">Filtrar por</h5>
                <Row className="px-3">
                  <FilterByAccount />
                  <FilterStringInput />
                </Row>
                <CardFooter className="border-top pb-0 mt-2 px-0">
                  <Col>
                    <Row>
                      <div className=" w-100 d-flex justify-content-start justify-content-md-end">
                        <ExpandAllCardsInfo />
                        <RetractAllCardsInfo />
                      </div>
                    </Row>
                  </Col>
                </CardFooter>
              </CardBody>
            </Card>
          </Col>

          <Col sm="12">
            {Object.keys(sales).map((sale, index) => {
              return (
                <div key={index}>
                  <SalesHeader toggleKey={index} />
                  <Collapse isOpen={!isCardOpen[index]}>
                    <Card>
                      <CardBody>
                        <SalesDefault id={index} />
                      </CardBody>
                    </Card>
                  </Collapse>
                  <Collapse isOpen={isCardOpen[index]}>
                    <Card>
                      <CardBody>
                        <SalesComplete id={index} />
                      </CardBody>
                    </Card>
                  </Collapse>
                </div>
              );
            })}
          </Col>

          <Col sm="12">
            <CardFooter
              style={{ backgroundColor: "#e4e5e6", borderTop: "0px" }}
            >
              <Paginate />
            </CardFooter>
          </Col>
        </>
      }
    />
  );
};

export default Main;
