import { useCallback, useContext, useState } from "react";
import Swal                                  from "sweetalert2";
import api, { headers }                      from "src/services/api";
import paymentContext                        from "../paymentContext";

/**
 * Generates a new payment order using the provided payment data.
 *
 * @return {{ createPayment: Promise, isLoading: boolean }} 
 * An object with two properties: 
 * - createPayment: a promise that resolves to the response from the API call to create the payment.
 * - isLoading: a boolean variable indicating if the payment is currently being processed.
 */
function usePayment() {
  const { state }                 = useContext(paymentContext);
  const [isLoading, setIsLoading] = useState(false);

  const createPayment = useCallback(async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("gateway", 1);
      formData.append("total_price",       state.payments.total);
      formData.append("internal_order_id", state.payments.internal_order_id);
      formData.append("cpf",               state.payerData.cpf_cnpj.replace(/[^\d]+/g, ""));
      formData.append("client_name",       state.payerData.razao_social)
      formData.append("address",           state.payerData.logradouro)
      formData.append("address_number",    state.payerData.numero)
      formData.append("zip_code",          state.payerData.cep.replace("-", ""))
      formData.append("district",          state.payerData.bairro)
      formData.append("city",              state.payerData.descricao_cidade)
      formData.append("state",             state.payerData.estado)
      return await api.post("/payments/orders/new/boleto", formData, headers());
    } catch (error) {
      await Swal.fire({
        title: "Ops!",
        html: error.response
          ? `<p>${error.response.data.message}</p>`
          : `<p>${error}</p>`,
        type: "warning",
        showCloseButton: true,
      });
      return error;
    } finally {
      setIsLoading(false);
    }
  }, [state.payerData.bairro, state.payerData.cep, state.payerData.cpf_cnpj, state.payerData.descricao_cidade, state.payerData.estado, state.payerData.logradouro, state.payerData.numero, state.payerData.razao_social, state.payments.internal_order_id, state.payments.total]);

  return { createPayment, isLoading };
}

export default usePayment;
