/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import PropTypes from "prop-types";
import Row from "reactstrap/lib/Row";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import Input from "./Input";
import api from "../../services/api";
import { getToken } from "../../services/auth";
import Swal from "sweetalert2";
import Footer from "./Footer";
import inputs from "./inputs";
import formatMoney from "../../helpers/formatMoney";
import Callout from "./Callout";

function Invoices({ history, location: { state } }) {
  const [form, setForm] = React.useState({
    bairro: "",
    cep: "",
    codigo_cidade: "",
    complemento: "",
    cpf_cnpj: "",
    descricao_cidade: "",
    email: "",
    estado: "",
    internal_order_id: state?.id,
    inscricao_municipal: "",
    logradouro: "",
    numero: "",
    razao_social: "",
    tipo_bairro: "",
    tipo_logradouro: "",
    user_id: null,
  });
  const updateForm = React.useCallback(
    ({ label, value }) =>
      setForm(previous => {
        return {
          ...previous,
          [label]: value,
        };
      }),
    [],
  );

  async function handleSubmitInvoice() {
    try {
      Object.keys(form).forEach(key => {
        if (!form[key]) {
          setForm(previous => {
            let update = previous;
            delete update[key];
            return {
              ...update,
            };
          });
        }
      });
      delete form["id"];
      const url = "/invoices/new";
      const response = await api.post(
        url,
        {
          data: {
            type: "new_invoice",
            attributes: form,
          },
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (response) {
        Swal.fire({
          title: "Atenção",
          text: response.data.message,
          type: response.data.status,
        }).then(user => {
          history.goBack();
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Atenção",
        text: error?.response?.data?.message || error?.message || error,
        type: "error",
      }).then(user => {
        history.goBack();
      });
    }
  }

  React.useEffect(() => {
    if (state?.id) {
      (async () => {
        try {
          const url = "/client-data";
          const {
            data: { data, status },
          } = await api.get(url, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (status === "success") {
            Object.keys(data[0]).forEach(label => {
              updateForm({ label, value: data[0][label] });
            });
          }
        } catch (error) {
          console.error(error);
        }
      })();
    } else history.goBack();
  }, []);

  React.useEffect(() => {
    if (form.cep && form.cep.length >= 8) {
      (async () => {
        const response = await api.get(`/cep/${form.cep}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        updateForm({ label: "codigo_cidade", value: response.data.data.ibge });
      })();
    }
  }, [form.cep]);

  return (
    <Card>
      <CardHeader className="card card-accent-primary">
        <h3 className="text-primary">Emissão de Nota Fiscal</h3>
      </CardHeader>
      <CardBody>
        <Row className="mb-2">
          <Callout color="primary" label="Id do pedido" value={state?.id} />
          <Callout color="success" label="Preço" value={formatMoney(state?.price)} />
          <Callout color="warning" label="Status do pagamento" value={state?.payment_status} />
          <Callout color="danger" label="Tipo do pagamento" value={state?.payment_type} />
        </Row>
        <Row>
          {inputs.map(({ label, type, id }, index) => {
            return (
              <Input key={index} label={label} type={type} id={id} value={form[id]} onChange={updateForm} />
            );
          })}
        </Row>
      </CardBody>
      <Footer history={history} handleSubmitInvoice={handleSubmitInvoice} />
    </Card>
  );
}

Invoices.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  state: PropTypes.object,
};

export default Invoices;
