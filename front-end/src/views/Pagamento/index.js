import React, { useEffect, useState } from "react";
import Pix                            from "./Pix";
import PagamentoContext               from "./context";
import { useDispatch }                from "react-redux";
import fetchUserData                  from "./fetchUserData";
import { PAYMENT_SAVE_CLIENT_DATA }   from "src/redux/actions/action-types";
import PaymentWarningMessage          from "../../components/PaymentWarningMessage";
import Swal                           from "sweetalert2";
import { CSpinner } from "@coreui/react";

export default function Pagamento() {
  const dispatch              = useDispatch();
  const [payment, setPayment] = useState({ name: "", text: "" });

  const setUserSavedData = (data) => dispatch({
    type: PAYMENT_SAVE_CLIENT_DATA,
    payload: data,
  });

  useEffect(() => {
    fetchUserData({ setUserSavedData });
  }, []);

  return (
    <PagamentoContext.Provider value={{ payment, setPayment }}>
      <Pix />
    </PagamentoContext.Provider>
  );
}
