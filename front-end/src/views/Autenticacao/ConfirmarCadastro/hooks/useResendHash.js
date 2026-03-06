import { useCallback } from "react";
import Swal            from "sweetalert2";
import api             from "src/services/api";

const useResendHash = () => {
  const fetchResendConfirmationCode = useCallback(async ({ email }) => {
    try {
      const url = "/user/resend-code";
      await api.post(url, { email });
      await Swal.fire({
        title: "Feito!",
        text: "Solicitação feita.",
        showCloseButton: true,
        type: "success",
      });
    } catch (error) {
      await Swal.fire({
        title: "Atenção",
        text: error.response ? error.response.data.message : error?.message || error,
        showCloseButton: true,
        type: "error",
      });
      if (error.response.data.statusCode === 409) {
        window.location.assign("#/entrar");
      }
    }
  }, []);

  const resendHashCodeEmail = useCallback(async (email) => {
    const { value } = await Swal.fire({
      title: "Atenção",
      type: "info",
      html: `<p>O MeuML enviou no seu e-mail o código de confirmação. Lembre-se de verificar as pastas de <b>SPAM</b> e <b>LIXEIRA</b>.</p>`,
      showCloseButton: true,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Não encontrei",
      cancelButtonText: "Eu tenho o código",
    })
    if (value) {
      Swal.close();
      const { value } = await Swal.fire({
        type: "question",
        title: "Código de Confirmação",
        html: `<p>Você deseja reenviar o código de confirmação para o email cadastrado?</p>`,
        showCloseButton: true,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Sim, reenviar.",
        cancelButtonText: "Cancelar",
      })
      if (value) await fetchResendConfirmationCode({ email });
    }
  }, [fetchResendConfirmationCode]);

  return { resendHashCodeEmail };
};

export default useResendHash;
