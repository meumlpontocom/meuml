/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Popup from "../ProductButtons/Popup";
import { InputGroup, InputGroupAddon, InputGroupText } from "reactstrap";
import Swal from "sweetalert2";

import { fetchProductShippingMshops, getAProductsMshops } from "../../requests";

export default function ProductUpdateShipping({ product, history }) {
  const [freeShipping, setFreeShipping] = useState("");

  const dispatch = useDispatch();

  async function fetchApi(advertising_id) {
    try {
      const data = { free_shipping: product.free_shipping === 0 ? true : false };

      const response = await fetchProductShippingMshops({ data, advertising_id, dispatch });

      handleApiResponse({ response });
    } catch (error) {
      return error;
    }
  }

  async function handleApiResponse({ response }) {
    try {
      if (response.data.message || response.message) {
        await Swal.fire({
          title: "Atenção",
          html: `<p>${response.data.message || response.message}</p>`,
          showCloseButton: true,
          type: response.data.status || response.status,
        });
        getAProductsMshops({ dispatch });
      }
    } catch (error) {
      await Swal.fire({
        title: "Erro",
        html: `<p>${error}</p>`,
        type: "error",
        showCloseButton: true,
      });
      getAProductsMshops({ dispatch });
    }
  }

  useEffect(() => {
    if (product.free_shipping === 1) {
      setFreeShipping("0");
    } else {
      setFreeShipping("1");
    }
  }, []);

  return (
    <Popup
      btnTitle="Alterar frete"
      popupCancenlBtnText="Cancelar"
      popupConfirmBtnText="Salvar Alteração"
      disabled={false}
      popupTitle="Alterar frete"
      popupType=""
      product={product}
      popupAction={() => fetchApi(product.external_id)}
      inputArea={
        <>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-truck" />
              </InputGroupText>
            </InputGroupAddon>
            <select
              value={freeShipping}
              className="custom-select"
              id="update-flex-shipping-status"
              readOnly={true}
            >
              <option value="1"> Com frete grátis </option>
              <option value="0"> Sem frete grátis </option>
            </select>
          </InputGroup>
        </>
      }
    />
  );
}
