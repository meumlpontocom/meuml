/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, createContext } from "react";
import * as fetch from "./fetch";
import { Redirect } from "react-router-dom";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
export const Data = createContext();

const AdminContainer = ({ children }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [adminAccountsLength, setAdminAccountsLength] = useState(0);
  const [listAllBlockades, setListAllBlockades] = useState(false);

  useEffect(() => {
    getUserEmail();
    fetchAdminAccounts();
  }, []);

  useEffect(() => {
    userEmail && handleIsAdmin();
  }, [userEmail]);

  async function fetchAdminAccounts() {
    try {
      const response = await fetch.apiGet({ url: "/accounts", dispatch });
      setAdminAccounts(response.data.data);
      setAdminAccountsLength(response.data.data.length);
      setIsLoading(false);
    } catch (error) {
      return error;
    }
  }

  function handleAdminName(email) {
    switch (email) {
      case "gustavoilhamorais@gmail.com":
        setAdminName("Gustavo");
        break;
      case "gabrielmouraodemelo@gmail.com":
        setAdminName("Gabriel");
        break;
      case "miltonbastos@gmail.com":
        setAdminName("Milton");
        break;
      case "milton@meuml.com":
        setAdminName("Milton");
        break;
      default:
        break;
    }
  }

  const renderRedirect = () => {
    if (redirect) return <Redirect to={"/home"} />;
  };

  function getUserEmail() {
    try {
      const userEmail = localStorage.getItem("@MeuML-UserEmail");
      setUserEmail(userEmail);
      handleAdminName(userEmail);
    } catch (error) {
      return error;
    }
  }

  function handleIsAdmin() {
    try {
      if (
        userEmail === "gustavoilhamorais@gmail.com" ||
        userEmail === "gabrielmouraodemelo@gmail.com" ||
        userEmail === "miltonbastos@gmail.com" ||
        userEmail === "milton@meuml.com"
      ) {
        setIsAdmin(true);
      } else setRedirect(true);
    } catch (error) {
      return error;
    }
  }

  async function unblockAll() {
    try {
      const response = await fetch.apiPatch("/admin/unblock/all");
      Swal.fire({
        html: `<p>${response.message}</p>`,
        type: response.status,
        showCloseButton: true,
      });
    } catch (error) {
      Swal.fire({
        title: "Atenção!",
        hmtl: `<p>${error.messasge}</p>`,
        type: "error",
        showCloseButton: true,
      });
    }
  }

  const handleListAllBlockades = () => setListAllBlockades(true);

  return (
    <Data.Provider
      value={{
        state: {
          isLoading,
          isAdmin,
          redirect,
          userEmail,
          adminName,
          adminAccounts,
          adminAccountsLength,
          listAllBlockades,
        },
        renderRedirect: () => renderRedirect(),
        unblockAll: () => unblockAll(),
        listAllBlockades: id => handleListAllBlockades(id),
        goToAdmin: () => (window.location.href = "/#/admin"),
      }}
    >
      {children}
    </Data.Provider>
  );
};

export default AdminContainer;
