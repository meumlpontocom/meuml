import React, { useEffect }         from "react";
import { useSelector, useDispatch } from "react-redux";
import { Picky }                    from "react-picky";
import axios                        from "axios";
import { getToken }                 from "../../../../../services/auth";
import Swal                         from "sweetalert2";
import { Col, Button, Row }         from "reactstrap";
import {
  saveAccounts,
  saveSelectedAccounts,
}                                   from "../../../../../redux/actions";
export default function FilterByAccount({ accounts, handleFetchApi }) {
  const dispatch = useDispatch();
  const selected = useSelector(
    (state) => state.advertsPositionGrid.selectedAccounts
  );
  const setSelected = (selected) => dispatch(saveSelectedAccounts(selected));

  const mountComponent = () => {
    if (accounts.length === 0) {
      fetchAccounts()
        .then((response) => {
          if (response.data.status === "success") {
            dispatch(
              saveAccounts(
                response.data.data.filter(
                  ({ platform, internal_status }) =>
                    platform === "ML" && internal_status === 1
                )
              )
            );
          } else {
            Swal.fire({
              title: "Atenção",
              html: `<p>${response.data.message}</p>`,
              showCloseButton: true,
            });
          }
        })
        .catch((error) => error);
    }
  };

  const fetchAccounts = async () => {
    try {
      return await axios.get(`${process.env.REACT_APP_API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (error) {
      return error;
    }
  };

  useEffect(() => mountComponent());

  return (
    <Col className="mb-3" sm="6" md="6" lg="6" xs="12">
      <Row>
        <Col>
          <Picky
            onChange={(selected) => setSelected(selected)}
            value={selected}
            options={accounts}
            open={false}
            multiple={true}
            labelKey="external_name"
            valueKey="id"
            includeFilter={true}
            dropdownHeight={600}
            includeSelectAll={true}
            placeholder="Filtrar por conta(s)"
            selectAllText="Selecionar Todos"
            filterPlaceholder="Filtrar por conta(s)"
            allSelectedPlaceholder="Todos (%s)"
            manySelectedPlaceholder="%s selecionadas"
          />
        </Col>
        <Col>
          <Button
            color="primary"
            onClick={() =>
              handleFetchApi({
                url: `filter_account=${selected.map((account) => account.id)}`,
              })
            }
            disabled={selected.length !== 0 ? false : true}
          >
            <i className="cil-filter" /> Filtrar
          </Button>
        </Col>
      </Row>
    </Col>
  );
}
