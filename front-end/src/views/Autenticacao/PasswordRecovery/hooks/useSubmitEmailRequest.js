import { useCallback, useContext, useState } from "react";
import Swal                                  from "sweetalert2";
import api                                   from "src/services/api";

const useSubmitEmailRequest = (context) => {
  const { email }                 = useContext(context);
  const [isLoading, setIsLoading] = useState(false);

  const shouldResendHashEmail = useCallback(() => {
    const lastEmailSentTimestamp = Number(localStorage.getItem("@MeuML#EmailSentTimestamp"));
    return !lastEmailSentTimestamp || Date.now() >= ((60000 * 5) + lastEmailSentTimestamp)
  }, []);

  const waitBeforeResendingEmailAlert = useCallback(async () => {
    return await Swal.fire({
      title: "Atenção!",
      type: "warning",
      text: "Por favor, aguarde pelo menos 5 minutos para reenviar o e-mail com o código de segurança.",
    });
  }, []);

  const sendConfirmationEmail = useCallback(async () => {
    if (!shouldResendHashEmail()) return await waitBeforeResendingEmailAlert();
    try {
      setIsLoading(true);
      const response = await api.post("/auth/resetpassword", { email });
      if (response.data.status === "success") {
        localStorage.setItem("@MeuML#EmailSentTimestamp", Date.now());
        setIsLoading(false);
        /* const { value } = **/ await Swal.fire({
          title: "Sucesso!",
          text: response.data.message,
          type: "success",
          showCloseButton: false,
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: "Entendi"
        });
        window.location.assign(`#/recuperar-senha/${email}`);
      }
    } catch (error) {
      setIsLoading(false);
      await Swal.fire({
        title: "Erro!",
        type: "error",
        text: error.response?.data?.message || error.message,
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: "Fechar",
      });
    }
  }, [email, shouldResendHashEmail, waitBeforeResendingEmailAlert]);

  return [sendConfirmationEmail, isLoading];
}

export default useSubmitEmailRequest;