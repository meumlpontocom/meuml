import { useCallback } from "react";
import Swal from "sweetalert2";
import { useHistory } from "react-router";
import api from "src/services/api";
import { login } from "src/services/auth";

const useConfirmationForm = () => {
  const history = useHistory();

  const redirectHome = useCallback((sessionData) => {
    const {
      token,
      expire,
      email,
      is_admin
    } = sessionData;

    login(token, expire, email, is_admin);

    history.push("/home");
  }, [history]);

  const showMessageAndRedirect = useCallback(
    async (message, status, sessionData) =>
      await Swal.fire({
        html: "<p>" + message + "</p>",
        type: status,
        showConfirmButton: !!sessionData,
        showCancelButton: !sessionData,
        showCloseButton: true,
        confirmButtonText: "Entrar",
        cancelButtonText: "Fechar"
      })
        .then(result => {
          if (result.value) {
            redirectHome(sessionData);
          }
        }),
    [redirectHome],
  );

  const handleSubmit = useCallback(
    async ({ email, hash }) => {
      const payload = { email, hash: hash.trim() };
      if (!payload.email) return showMessageAndRedirect("Não foi possível obter seu email.", "error");
      else if (!payload.hash) {
        return showMessageAndRedirect("Cole o código enviado para seu e-mail no campo abaixo!", "error");
      } else {
        try {
          const response = await api.post("/auth/confirm", payload);
          const status = response.data.status;
          const message = response.data.message;

          const token = response.data.data.jwt;
          const expire = response.data.data.expires_in;
          const email = response.data.data.user.email;
          const is_admin = response.data.data.user.is_admin;

          const sessionData = {
            token,
            expire, 
            email, 
            is_admin,
          }

          if (status === "success") showMessageAndRedirect(message, status, sessionData);
          else showMessageAndRedirect(message, "error");
        } catch (error) {
          const errorMessage = error.response?.data?.message ?? error.message;
          showMessageAndRedirect(errorMessage, "error");
        }
      }
    },
    [showMessageAndRedirect],
  );

  return [handleSubmit, history];
};

export default useConfirmationForm;
