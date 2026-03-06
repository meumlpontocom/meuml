/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";

const useAuthentication = () => {
  const checkIsAuthenticated = useCallback(() => {
    if (localStorage.getItem("@MeuML-Token")) {
      const jwtExpiresIn = localStorage.getItem("@MeuML-Token-expire");
      return jwtExpiresIn && new Date(jwtExpiresIn) > new Date();
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(() => checkIsAuthenticated());

  const setAuthObserver = useCallback(() => {
    return setInterval(() => setIsAuthenticated(() => checkIsAuthenticated()), 1000);
  }, [checkIsAuthenticated]);

  useEffect(() => {
    const i = setAuthObserver();
    return () => {
      clearInterval(i);
    };
  }, []);

  return [isAuthenticated];
};

export default useAuthentication;
