import { useCallback, useContext, useState } from "react";
import Swal                                  from "sweetalert2";
import api                                   from "src/services/api";
import updatePasswordContext                 from "../updatePasswordContext";

const useUpdatePassword = () => {
  const [isLoading, setIsLoading]                 = useState(false);
  const { hash, email, password, confirmPassword } = useContext(updatePasswordContext);

  const updatePassword = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.put("/user/updatepassword", {
        hash,
        email,
        password,
        password2: confirmPassword,
      });
      setIsLoading(false);
      if (response.data.status === "success") {
        /* const { value } = **/ await Swal.fire({
          title: "Sucesso!",
          type: "success",
          text: response.data.message,
          showCloseButton: false,
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: "Entrar",
        });
        window.location.assign("#/entrar");
      }
    } catch (error) {
      setIsLoading(false);
      await Swal.fire({
        title: "Erro!",
        type: "error",
        text: error.response?.data?.message || error.message,
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: "Fechar",
      });
    }
  }, [email, hash, password, confirmPassword]);

  return [updatePassword, isLoading];
};

export default useUpdatePassword;
