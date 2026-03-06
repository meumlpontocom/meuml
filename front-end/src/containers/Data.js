/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import api from "src/services/api";
import { getToken } from "../services/auth";
import { useDispatch, useSelector } from "react-redux";
import { saveAccounts, setAccountsIsLoading } from "src/redux/actions";

export const Data = React.createContext();

export function AccountContainer({ children }) {
  const dispatch = useDispatch();
  const { accounts, isLoading } = useSelector(({ accounts }) => accounts);

  React.useEffect(() => {
    if (!isLoading && !accounts.length) {
      fetchAccounts();
    }
  }, []);

  async function fetchAccounts() {
    try {
      dispatch(setAccountsIsLoading(true));
      const {
        status,
        data: { data },
      } = await api.get("/accounts", {
        headers: { Authorization: "Bearer " + getToken() },
      });
      if (status === 200) {
        dispatch(saveAccounts(data));
      }
      dispatch(setAccountsIsLoading(false));
    } catch (error) {
      console.log(error);
      dispatch(setAccountsIsLoading(false));
    }
  }

  return (
    <Data.Provider
      value={{
        isLoading,
        fetchAccounts,
      }}
    >
      {children}
    </Data.Provider>
  );
}
