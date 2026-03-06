import React from "react";
import PropTypes from "prop-types";
import {
  CCol as Col,
  CRow as Row,
  CButton as Button,
  CInput as Input,
  CInputGroup as InputGroup,
  CInputGroupText as InputGroupText,
  CInputGroupPrepend,
} from "@coreui/react";
import FormInput from "../../../FormInput";
import Swal from "sweetalert2";
import formFields from "./formFields";
import { useForm } from "react-hook-form";
import { fetchApi } from "../../requests";
import { useDispatch, useSelector } from "react-redux";
import inputs from "./inputs";
import validatedClassName from "../validateClassNames";
import getAppropriateSavedClientData from "../../../getAppropriateSavedClientData";

function CreditCardForm({
  history,
  setLoading,
  setFormStage,
  documentType,
}) {
  const dispatch = useDispatch();
  const userSavedData = useSelector(({ payments }) => payments.clientData);
  const payments = useSelector((state) => state.payments);
  const [hasFocusedOnce, setHasFocusedOnce] = React.useState([]);
  const [form, setForm] = React.useState({ ...formFields });
  const { handleSubmit, register } = useForm({
    mode: "onBlur",
    validateCriteriaMode: "firstError",
  });

  function validateForm() {
    let empty_fields = [];
    for (const key in form) {
      if (form[key] === "") {
        empty_fields.push(key);
      }
      switch (key) {
        case "creditcard_expiration_year":
          if (form[key].split("_")[0].length < 4) empty_fields.push(form[key]);
          break;
        case "creditcard_expiration_month":
          if (form[key].split("_")[0].length < 2) empty_fields.push(key);
          else if (form[key].split("_")[0] > 12) empty_fields.push(key);
          break;
        default:
          break;
      }
    }
    return empty_fields.length;
  }

  function onSubmit(data) {
    if (!validateForm()) {
      setLoading(true);
      const formData = new FormData();
      formData.append("gateway", 1);
      formData.append("internal_order_id", payments.checkoutId);
      formData.append("total_price", payments.total);
      formData.append("creditcard_token", data["pjbank-token"]);
      formData.append("creditcard_number", data["creditcard_number"]);
      formData.append("creditcard_name", form["creditcard_name"]);
      formData.append(
        "creditcard_cpf",
        form["creditcard_cpf"].split(/[.\/ -]/).join("")
      );
      formData.append("creditcard_email", form["creditcard_email"]);
      formData.append(
        "creditcard_expiration_month",
        form["creditcard_expiration_month"]
      );
      formData.append(
        "creditcard_expiration_year",
        form["creditcard_expiration_year"]
      );
      formData.append(
        "creditcard_phone",
        form["creditcard_phone"].split(" ").join("")
      );
      formData.append("creditcard_cvv", form["creditcard_cvv"]);

      return fetchApi({ dispatch, formData, setLoading, history });
    } else {
      Swal.fire({
        title: "Atenção!",
        type: "warning",
        showCloseButton: true,
        html:
          "<p>Certifique-se de preencher TODOS os campos corretamente para finalizar sua compra!</p>",
      });
    }
  }

  const onChange = ({ name, eventValue }) => {
    setForm(
      Object.assign(
        {},
        { ...form },
        {
          [name]: eventValue,
        }
      )
    );
  };

  React.useEffect(() => {
    const data = getAppropriateSavedClientData({ documentType, userSavedData });
    if (data) {
      const { cpf_cnpj, email, razao_social } = data;
      setForm({
        ...form,
        creditcard_name: razao_social,
        creditcard_cpf: cpf_cnpj,
        creditcard_email: email,
      });
    }
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="fadeIn">
      <input
        type="hidden"
        name="pjbank-token"
        id="pjbank-token"
        className="pjbank-token"
        ref={register}
      />
      <Row>
        <Col xs="12">
          <h6 className="text-danger mt-5 text-left">
            Dados do titular do cartão
          </h6>
        </Col>
        {inputs.map((props, index) => {
          return (
            <FormInput
              {...props}
              key={index}
              value={form}
              onFocus={(event) =>
                setHasFocusedOnce([
                  ...hasFocusedOnce,
                  event.target.name.toString(),
                ])
              }
              onChange={(event) =>
                onChange({
                  name: event.target.name,
                  eventValue: event.target.value,
                })
              }
              className={validatedClassName({
                form,
                hasFocusedOnce,
                input: props.id,
              })}
            />
          );
        })}
        <Col xs={12} style={{ padding: "0 0 0" }}>
          <Col xs={8} style={{ marginTop: "2.1em", color: "#bcbcbc" }}>
            <label htmlFor="cartao">Número do Cartão</label>
            <InputGroup>
              <CInputGroupPrepend>
                <InputGroupText>
                  <i className="cil-credit-card" />
                </InputGroupText>
              </CInputGroupPrepend>
              <Input
                type="text"
                id="cartao"
                name="creditcard_number"
                className="pjbank-cartao"
                placeholder="Número de Cartão Válido"
                innerRef={register}
              />
            </InputGroup>
          </Col>
        </Col>
      </Row>
      <Row style={{ marginTop: "2.1em" }}>
        <Col>
          <Button style={{ float: "left" }} onClick={() => setFormStage(1)}>
            <i className="cil-arrow-left mr-1" />
            Voltar
          </Button>
        </Col>
        <Col>
          <Button
            color="danger"
            className="mr-2"
            onClick={() => history.goBack()}
          >
            <i className="cil-x mr-1" />
            Cancelar
          </Button>
          <Button type="submit" color="success">
            <i className="cil-check mr-1" />
            Finalizar
          </Button>
        </Col>
      </Row>
    </form>
  );
}

CreditCardForm.propTypes = {
  history: PropTypes.object,
  setLoading: PropTypes.func,
  payments: PropTypes.object,
};

export default CreditCardForm;
