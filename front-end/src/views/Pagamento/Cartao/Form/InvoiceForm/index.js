import React                                           from "react";
import PropTypes                                       from "prop-types";
import { CCol as Col, CRow as Row, CButton as Button } from "@coreui/react";
import FormInput                                       from "../../../FormInput";
import inputs                                          from "./inputs";
import validatedClassName                              from "../validateClassNames";
import formFields                                      from "./formFields";
import { newInvoice, searchCep }                       from "../../requests";
import { useDispatch, useSelector }                    from "react-redux";
import getAppropriateSavedClientData                   from "../../../getAppropriateSavedClientData";
import { CitiesOfBrazilSelect, StatesOfBrazilSelect }  from "../../../../../components/StatesAndCitiesSelect";

function InvoiceForm({ history, documentType, setFormStage }) {
  const dispatch = useDispatch();
  const userSavedData = useSelector(({ payments }) => payments.clientData);
  const availableStates = useSelector(state => state.geo.availableStates);
  const internal_order_id = useSelector(({ payments }) => payments.checkoutId);
  const userId = useSelector(({ accounts }) => Object.values(accounts.accounts)[0]?.user_id);
  const [cityCode, setCityCode] = React.useState("");
  const [hasFocusedOnce, setHasFocusedOnce] = React.useState([]);
  const [form, setForm] = React.useState({ ...formFields, internal_order_id });
  const onChange = ({ name, eventValue }) => {
    if (name === "cep" && eventValue !== "_____-___") {
      searchCep({
        cep: eventValue,
        form,
        setForm,
        setCityCode,
        dispatch,
        availableStates
      });
    }
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
  const submitInvoiceForm = () => {
    newInvoice({
      form: { ...form, user_id: userId, codigo_cidade: cityCode },
      setFormStage,
    });
  };
  const isNextBtnDisabled = React.useCallback(() => {
    const reduced = Object.keys(form).reduce((previous, input) => {
      if (
        input === "inscricao_municipal" &&
        form["cpf_cnpj"].length === 18 &&
        !form[input]
      )
        return [...previous, input];
      else if (
        input !== "inscricao_municipal" &&
        input !== "complemento" &&
        !form[input]
      )
        return [...previous, input];

      return previous;
    }, []);
    return reduced.length;
  }, [form]);

  React.useEffect(() => {
    const data = getAppropriateSavedClientData({ documentType, userSavedData });
    if (data) {
      const {
        bairro,
        cep,
        complemento,
        cpf_cnpj,
        email,
        estado,
        inscricao_municipal,
        logradouro,
        numero,
        razao_social,
        descricao_cidade,
        codigo_cidade,
      } = data;

      setForm({
        ...form,
        bairro,
        cep,
        complemento,
        cpf_cnpj,
        email,
        estado,
        inscricao_municipal,
        logradouro,
        numero,
        razao_social,
        descricao_cidade,
      });
      setCityCode(codigo_cidade);
    }
  }, []);

  React.useEffect(() => {
    if (form.estado) {
      const states = availableStates.filter(_state => _state.sigla.toUpperCase() === form.estado.toUpperCase());
      states && (dispatch({ type: "SET_SELECTED_STATE_LIST", states }));
      form.descricao_cidade && dispatch({ type: "SET_SELECTED_CITIES", cities: form.descricao_cidade });
    }
  }, [availableStates, dispatch, form.descricao_cidade, form.estado]);

  return (
    <>
      <Row className="fadeIn">
        {inputs({ documentType }).map((props, index) => {
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
        <Col xs={12} sm={6} className="mt-4">
          <label>Estado</label>
          <StatesOfBrazilSelect/>
        </Col>
        <Col xs={12} sm={6} className="mt-4">
          <label>Cidade</label>
          <CitiesOfBrazilSelect/>
        </Col>
      </Row>
      <Row style={{ marginTop: "2.1em" }}>
        <Col>
          <Button style={{ float: "left" }} onClick={() => setFormStage(0)}>
            <i className="cil-arrow-left mr-1"/>
            Voltar
          </Button>
        </Col>
        <Col>
          <Button
            color="danger"
            className="mr-2"
            onClick={() => history.goBack()}
          >
            <i className="cil-x mr-1"/>
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={() => submitInvoiceForm()}
            disabled={isNextBtnDisabled()}
          >
            Próximo
            <i className="cil-arrow-right ml-1"/>
          </Button>
        </Col>
      </Row>
    </>
  );
}

InvoiceForm.propTypes = {
  history: PropTypes.object,
  documentType: PropTypes.string,
  setFormStage: PropTypes.func,
};

export default InvoiceForm;
