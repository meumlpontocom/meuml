import { useContext, useCallback, useState } from "react";
import Swal                                  from "sweetalert2";
import api, { headers }                      from "src/services/api";
import paymentContext                        from "../paymentContext";

/**
 * Generates a new invoice order using the provided user data.
 *
 * @return {{ createNewInvoice: Promise, isLoading: boolean }} An object with two keys: 
 * - createNewInvoice: a promise that resolves to the response from the API call to create the invoice.
 * - isLoading: a boolean variable indicating if the invoice is currently being processed.
 */
function useInvoice() {
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useContext(paymentContext);

  const createNewInvoice = useCallback(async () => {
    if (state.payments.internal_order_id) {  
      try {
        setIsLoading(true);
        const payload = {
          data: {
            type: "new_invoice",
            attributes: {
              ...state.payerData,
              tipo_bairro: "",
              tipo_logradouro: "",
              internal_order_id: state.payments.internal_order_id,
            }
          },
        };
        delete payload.data.attributes.id;
        const url = "/invoices/new";
        return await api.post(url, payload, headers());
      } catch (error) {
        Swal.fire({
          title: "Atenção",
          text: error?.response?.data?.message || error?.message || error,
          type: "error",
        });
        return error;
      } finally {
        setIsLoading(false);
      }
    } else return { error: "missing_internal_order_id" };
  }, [state.payerData, state.payments.internal_order_id]);

  return { createNewInvoice, isLoading };
}

export default useInvoice;
