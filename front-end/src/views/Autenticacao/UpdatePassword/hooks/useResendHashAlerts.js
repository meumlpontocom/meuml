import { useCallback } from "react";
import Swal            from "sweetalert2";

const useResendHashAlerts = () => {
  const checkSpamAndTrashInboxesAlert = useCallback(async () => {
    const { value } = await Swal.fire({
      title: "Atenção!",
      type: "warning",
      text: "Lembre-se de verificar a caixa de SPAM e a LIXEIRA no seu e-mail. Se o problema persistir, entre em contato com o suporte.",
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: "Encontrei",
      confirmButtonText: "Não recebi",
    });
    return value;
  }, []);

  const confirmResendingHashEmailAlert = useCallback(async () => {
    const { value } = await Swal.fire({
      title: "Reenviar",
      type: "question",
      text: "Você deseja reenviar o email com o código de segurança?",
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Reenviar",
    });
    return value;
  }, []);

  return { checkSpamAndTrashInboxesAlert, confirmResendingHashEmailAlert };
};

export default useResendHashAlerts;
