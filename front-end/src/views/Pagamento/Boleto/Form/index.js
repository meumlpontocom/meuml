import React, { useState }           from "react";
import inputs                        from "./inputs";
import PropTypes                     from "prop-types";
import Swal                          from "sweetalert2";
import { useDispatch, useSelector }  from "react-redux";
import FormInput                     from "../../FormInput";
import { useForm }                   from "react-hook-form";
import { useHistory }                from "react-router-dom";
import api                           from "src/services/api";
import { getToken }                  from "src/services/auth";
import validateClassName             from "./validateClassNames";
import { newInvoice }                from "../../Cartao/requests";
import getAppropriateSavedClientData from "../../getAppropriateSavedClientData";
import {
  CitiesOfBrazilSelect,
  StatesOfBrazilSelect,
}                                    from "../../../../components/StatesAndCitiesSelect";
import {
  CCol as Col, CRow as Row,
  CButton as Button
}                                    from "@coreui/react";

const Form = ({ payments, setLoading, documentType, setFormStage }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { handleSubmit } = useForm();
  const availableStates = useSelector(state => state.geo.availableStates);
  const userId = useSelector(({ accounts }) => Object.values(accounts.accounts)[0]?.user_id);
  const internal_order_id = useSelector(({ payments }) => payments.checkoutId);
  const userSavedData = useSelector(({ payments }) => payments.clientData);
  const [hasFocusedOnce, setHasFocusedOnce] = useState([]);
  const [cityCode, setCityCode] = useState("");
  const [form, setForm] = useState({
    client_name: "",
    cpf: "",
    address: "",
    address_number: "",
    address_additional_info: "",
    zip_code: "",
    district: "",
    city: "",
    state: "",
    email: "",
  });
  const sleep = async ms => await new Promise(r => setTimeout(r, ms));

  const showPayment = React.useCallback(async (paymentUrl) => {
    await sleep(7776);
    setLoading(false);
    const options = await Swal.fire({
      type: "success",
      title: "Pagamento",
      text: "Sua cobrança foi gerada com sucesso!",
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: "Abrir",
    });
    if (options.dismiss) return;
    window.open(paymentUrl, "blank");
    history.push("/home");
  }, [Swal, history]);

  async function handleFetch(formData) {
    try {
      const response = await api.post("/payments/orders/new/boleto", formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      await showPayment(response.data.data);
    } catch (error) {
      await Swal.fire({
        title: "Ops!",
        html: error.response ? `<p>${error.response.data.message}</p>` : `<p>${error}</p>`,
        type: "warning",
        showCloseButton: true,
      });
      return error.response || error;
    }
  }

  async function onSubmit() {
    setLoading(true);
    let blankFields = [];
    const formData = new FormData();
    formData.append("gateway", 1);
    formData.append("total_price", payments.total);
    formData.append("internal_order_id", payments.checkoutId);
    for (const input in form) {
      if (form[input] !== "") {
        switch (input.toString()) {
          case "cpf":
            formData.append(
              input.toString(),
              form[input].split(/[.\/ -]/).join(""),
            );
            break;
          case "zip_code":
            formData.append(
              input.toString(),
              form[input].split(/[.\/ -]/).join(""),
            );
            break;

          case "email":
            break;

          default:
            formData.append(input.toString(), form[input]);
            break;
        }
      } else {
        if (input.toString() !== "address_additional_info") blankFields.push(input.toString());
      }
    }
    if (!blankFields.length) {
      let formObject = {
        internal_order_id,
        cpf_cnpj: form.cpf,
        razao_social: form.client_name,
        email: form.email,
        descricao_cidade: form.city,
        cep: form.zip_code,
        logradouro: form.address,
        complemento: form.address_additional_info,
        estado: form.state,
        numero: form.address_number,
        bairro: form.district,
        user_id: userId,
        codigo_cidade: cityCode,
      };
      if (form.inscricao_municipal)
        formObject["inscricao_municipal"] = form.inscricao_municipal;

      return await newInvoice({
        form: formObject,
        setFormStage: console.log,
      }).then((response) => {
        if (response.data.status === "success") {
          handleFetch(formData);
        }
      });
    } else {
      Swal.fire({
        title: "Atenção",
        html: "<p>Certifique-se de preencher TODOS os campos corretamente!",
        type: "warning",
        showConfirmButton: true,
      });
      setLoading(false);
    }
  }

  function searchCep(cep) {
    if (cep.replace(/[_\/ ]/).length === 9) {
      const url = `https://viacep.com.br/ws/${cep}/json/`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (!("erro" in data)) {
            setForm({
              ...form,
              zip_code: cep,
              address: data.logradouro,
              district: data.bairro,
              city: data.localidade,
              state: data.uf,
            });
            setCityCode(data.ibge);
            const states = availableStates.filter(_state => _state.sigla === data.uf)[0];
            dispatch({ type: "SET_SELECTED_STATE_LIST", states });
            const cities = states.cidades.filter(_city => _city === data.localidade)[0];
            dispatch({ type: "SET_SELECTED_CITIES", cities });
          } else {
            Swal.fire({
              type: "error",
              title: "Atenção!",
              html:
                "<p>CEP inválido. Certifique-se de preencher o formulário com dados válidos para prosseguir.</p>",
              showConfirmButton: true,
            }).then(() => (document.querySelector("#zip_code").value = ""));
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  const onChange = ({ name, value }) => {
    const isValidCep = name === "zip_code" && value !== "_____-___";
    if (isValidCep) searchCep(value);
    setForm(
      Object.assign(
        {},
        { ...form },
        {
          [name]: value,
        },
      ),
    );
  };

  React.useEffect(() => {
    const data = getAppropriateSavedClientData({
      documentType,
      userSavedData,
    });

    if (data) {
      const _form = {
        cpf: data.cpf_cnpj,
        client_name: data.razao_social,
        address: data.logradouro,
        address_number: data.numero,
        address_additional_info: data.complemento,
        zip_code: data.cep,
        district: data.bairro,
        city: data.descricao_cidade,
        state: data.estado,
        email: data.email,
      };
      setForm(_form);
      setCityCode(data.codigo_cidade);
    }
  }, []);

  React.useEffect(() => {
    if (form.state) {
      const states = availableStates.filter(_state => _state.sigla === form.state);
      states && (dispatch({ type: "SET_SELECTED_STATE_LIST", states }));
      form.city && dispatch({ type: "SET_SELECTED_CITIES", cities: form.city });
    }
  }, [availableStates, dispatch, form.city, form.state]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        {inputs({ documentType }).map((props, index) => {
          return (
            <FormInput
              key={index}
              {...props}
              value={form}
              className={validateClassName({
                input: props.name,
                form,
                hasFocusedOnce,
              })}
              onFocus={() => setHasFocusedOnce([...hasFocusedOnce, props.id])}
              onChange={(event) =>
                onChange({
                  name: event.target.name,
                  value: event.target.value,
                })
              }
            />
          );
        })}
        <Col xs={12} sm={6} className="mt-4">
          <label>Estado</label>
          <StatesOfBrazilSelect />
        </Col>
        <Col xs={12} sm={6} className="mt-4">
          <label>Cidade</label>
          <CitiesOfBrazilSelect />
        </Col>
      </Row>
      <Row className="mt-5">
        <Col>
          <Button className="float-left" onClick={() => setFormStage(0)}>
            <i className="cil-arrow-left mr-1" />
            Voltar
          </Button>
        </Col>
        <Col>
          <Button
            type="button"
            color="danger"
            className="mr-2"
            onClick={() => history.goBack()}
          >
            <i className="cil-x mr-1" />
            Cancelar
          </Button>
          <Button type="submit" color="primary">
            Enviar
            <i className="cil-check ml-1" />
          </Button>
        </Col>
      </Row>
    </form>
  );
};

Form.propTypes = {
  history: PropTypes.object,
  setLoading: PropTypes.func,
  payments: PropTypes.object,
  documentType: PropTypes.string,
};

export default Form;
