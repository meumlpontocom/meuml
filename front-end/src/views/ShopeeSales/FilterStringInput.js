import React from "react";
import { Col, Button, Input, Label } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { fetchSales } from "./requests";
import { setSalesFilterString } from "../../../redux/actions/_shopeeActions";

const SalesFilterAccounts = () => {
  const dispatch = useDispatch();
  const { filterString, selectedAccounts } = useSelector(
    ({ shopee }) => shopee.sales
  );

  function handleChange({ target: { value } }) {
    dispatch(setSalesFilterString(value));
  }

  function clearInputValue() {
    dispatch(setSalesFilterString(""));
  }

  return (
    <Col xs="12" sm="12" md="12" lg="8" xl="8" className="px-0">
      <Label htmlFor="filter-by">ID, produto, cliente</Label>
      <div className="d-flex flex-wrap px-0">
        <div className="flex-grow-1 mr-0 mr-sm-2 mb-3 mb-sm-0">
          <Input
            onChange={handleChange}
            value={filterString}
            id="filter-by"
            name="filter-by"
            placeholder="ID do pedido, nome do produto ou nome do cliente"
          />
        </div>
        <div className="d-flex">
          <div className="px-0">
            <Button
              className="btn btn-primary text-white"
              onClick={() =>
                fetchSales({ dispatch, selectedAccounts, filterString })
              }
            >
              <i className="cui cui-search mr-2" /> Pesquisar
            </Button>
          </div>
          <div className="px-0 ml-2">
            <Button
              className="btn btn-default text-body"
              onClick={clearInputValue}
            >
              <i className="cui cui-x mr-2" /> Limpar
            </Button>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default SalesFilterAccounts;
