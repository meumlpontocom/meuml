/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "src/services/api";
import { getToken } from "src/services/auth";

const useMLAccountCallback = () => {
  const [redirectTrigger, setRedirect] = useState(false);

  const tokenExists = useMemo(() => {
    const { href } = window.location;
    if (!href?.match("code=")) return false;
    return href.split("code=")[1].split("&state=")[0];
  }, [window.location]);

  const handleCallbackResult = useCallback(({ redirect, status, message }) => {
    localStorage.setItem("@MeuML#MLAddAccCB", JSON.stringify({ status, message }));
    setRedirect(redirect);
  }, []);

  const apiPostToken = useCallback(
    async token => {
      try {
        const response = await api.post(
          "/accounts/from-mercado-livre",
          { code: token },
          { headers: { Authorization: "Bearer " + getToken() } },
        );
        handleCallbackResult({
          redirect: true,
          status: response.data.status,
          message: response.data.message,
        });
      } catch (error) {
        handleCallbackResult({
          redirect: true,
          status: "error",
          message: error?.response?.data?.message || error.message,
        });
      }
    },
    [handleCallbackResult],
  );

  useEffect(() => {
    const nextURL = localStorage.getItem("@MeuML#NextURL");
    if (!!nextURL) {
      localStorage.removeItem("@MeuML#NextURL");
      window.location.href = nextURL;
    } else {
      if (tokenExists) {
        apiPostToken(tokenExists);
      } else {
        handleCallbackResult({
          redirect: true,
          status: 404,
          message: "Falha ao adicionar conta: nenhum token válido retornado do ML.",
        });
      }
    }
  }, [apiPostToken, handleCallbackResult, window.location?.state?.next, tokenExists]);

  return [redirectTrigger];
};

export default useMLAccountCallback;
