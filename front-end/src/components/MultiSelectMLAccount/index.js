import React, { useEffect, useMemo }          from "react";
import { useSelector, useDispatch }           from "react-redux";
import { saveAccounts, saveSelectedAccounts } from "../../redux/actions";
import { Picky }                              from "react-picky";
import axios                                  from "axios";
import { getToken }                           from "../../services/auth";
import Swal                                   from "sweetalert2";
import { Col, Button, Row }                   from "reactstrap";

export default function MultiSelectAccount({ callBack, style }) {
  const dispatch = useDispatch();
  const accounts = useSelector((state) => state.accounts.accounts);
  const selected = useSelector((state) => state.accounts.selectedAccounts);
  const accountArray = useMemo(() => {
    return Object.values(accounts)
      .filter(({ platform }) => platform === "ML")
      .map((acc) => acc);
  }, [accounts]);
  const setSelected = (selected) => dispatch(saveSelectedAccounts(selected));
  const handleFilter = () => callBack(true);
  const fetchAccounts = async () => {
    try {
      return await axios.get(`${process.env.REACT_APP_API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (error) {
      return error;
    }
  };

  const mountComponent = () => {
    switch (accounts.length) {
      case 0:
        fetchAccounts()
          .then((response) => {
            if (response.data.status === "success") {
              dispatch(saveAccounts(response.data.data));
            } else {
              Swal.fire({
                title: "Atenção",
                html: `<p>${response.data.message}</p>`,
                showCloseButton: true,
              });
            }
          })
          .catch((error) => error);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    mountComponent();
  }, []);
  const _style = { justifyContent: "center" };
  return (
    <Row style={style || _style}>
      <Col
        xs={{ size: 10 }}
        sm={{ size: 10 }}
        md={{ size: 7, offset: 1 }}
        lg={{ size: 7, offset: 1 }}
      >
        <Picky
          onChange={(selected) => setSelected(selected)}
          value={selected}
          options={accountArray}
          open={false}
          multiple={true}
          labelKey="name"
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
      <Col
        xs={{ size: 2 }}
        sm={{ size: 2 }}
        md={{ size: 2 }}
        lg={{ size: 2 }}
        style={{ padding: "0 0 0", float: "right" }}
      >
        <Button
          color="primary"
          onClick={() => handleFilter()}
          disabled={selected.length === 0}
        >
          <i className="cil-filter" /> Filtrar
        </Button>
      </Col>
    </Row>
  );
}
