import React from "react";
import decimalFormat from "src/helpers/decimalFormat";
import { requestPayment } from "src/redux/actions";
import Swal from "sweetalert2";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";

export async function handleSubmitInvoice({ form, history }) {
  try {
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
      }
    );
    if (response) {
      Swal.fire({
        title: "Atenção",
        text: response.data.message,
        type: response.data.status,
      });
      return true;
    }
    return false;
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      text: error?.response?.data?.message || error?.message || error,
      type: "error",
    }).then(() => {
      history.goBack();
    });
  }
}

export async function fetchApi({ dispatch, formData, setLoading, history }) {
  try {
    setLoading(true);

    const {
      data: { message, status },
    } = await api.post("/payments/orders/new/creditcard", formData, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    Swal.fire({
      title: "Sucesso!",
      html: `<p>${message}</p>`,
      type: status,
      showCloseButton: true,
    }).then(() =>
      history.push("/assinaturas/plano-atual")
    );

    dispatch(
      requestPayment({
        checkoutId: 0,
        total: decimalFormat(0),
      })
    );
  } catch (error) {
    if (error.response) {
      Swal.fire({
        title: "Ops!",
        html: `<p>${error.response.data.message}</p>`,
        type: "error",
        showCloseButton: true,
      });
      return error.response;
    }
    return error;
  } finally {
    setLoading(false);
  }
}

export const newInvoice = async ({ form, setFormStage }) => {
  try {
    const url = "/invoices/new";
    const response = await api.post(
      url,
      {
        data: {
          type: "new_invoice",
          attributes: {
            ...form,
            tipo_bairro: "",
            tipo_logradouro: "",
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    setFormStage(2);
    return response;
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      text: error?.response?.data?.message || error?.message || error,
      type: "error",
    }).then(() => {
      setFormStage(1);
    });
    return error.response;
  }
};

export const searchCep = ({ cep, form, setForm, setCityCode, availableStates, dispatch }) => {
  if (cep.replace(/[_\/ ]/).length === 9) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    setForm({
      ...form,
      cep,
      logradouro: "loading",
      bairro: "loading",
      descricao_cidade: "loading",
      estado: "loading",
    });
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if ("erro" in data) {
          Swal.fire({
            type: "error",
            title: "Atenção!",
            html:
              "<p>CEP inválido. Certifique-se de preencher o formulário com dados válidos para prosseguir.</p>",
            showConfirmButton: true,
          }).then(() => (document.querySelector("#zip_code").value = ""));
        } else {
          setForm({
            ...form,
            cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            descricao_cidade: data.localidade,
            estado: data.uf,
          });
          setCityCode(data.ibge);
          const states = availableStates.filter(_state => _state.sigla === data.uf);
          dispatch({ type: "SET_SELECTED_STATE_LIST", states });
          const cities = states.cidades.filter(_city => _city === data.localidade)[0];
          dispatch({ type: "SET_SELECTED_CITIES", cities });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
};
