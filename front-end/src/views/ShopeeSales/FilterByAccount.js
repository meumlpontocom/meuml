import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import SelectAccounts from "../../../components/SelectAccounts";
import Col from "reactstrap/lib/Col";
import Row from "reactstrap/lib/Row";
import Button from "reactstrap/lib/Button";
import Label from "reactstrap/lib/Label";
import { fetchSales } from "./requests";
import { setSelectedAccountList } from "../../../redux/actions/_shopeeActions";

export default function FilterByAccount() {
  const dispatch = useDispatch();
  const { selectedAccounts, filterString } = useSelector(
    ({ shopee }) => shopee.sales
  );
  const handleCallback = useCallback((selected) => {
    dispatch(setSelectedAccountList(selected));
  }, []);

  return (
    <Col
      xs="12"
      sm="12"
      md="12"
      lg="4"
      xl="4"
      className="p-0 pr-0 pr-lg-2 mb-3 mb-xl-0"
    >
      <Label htmlFor="select-account">Conta da Shopee</Label>
      <Row id="select-account">
        <Col style={{ padding: "0px 5px 0px 15px" }}>
          <SelectAccounts
            callback={handleCallback}
            selected={selectedAccounts}
            placeholder="Filtrar por conta(s)"
          />
        </Col>
        <Col xs="4" style={{ padding: "0px 0px 0px 5px" }}>
          <Button
            color="primary"
            onClick={() =>
              fetchSales({ dispatch, selectedAccounts, filterString })
            }
          >
            <i className="cui cui-filter mr-2" /> Filtrar
          </Button>
        </Col>
      </Row>
    </Col>
  );
}
