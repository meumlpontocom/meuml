import React, { useState, useEffect, useRef } from "react";

//Reactstrap
import Input from "reactstrap/lib/Input";
import Label from "reactstrap/lib/Label";

//Stylesheet and custom components
import EditIcon from "./EditIcon";
import { useDispatch, useSelector } from "react-redux";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";

const PaymentInput = () => {
  const dispatch = useDispatch();
  const {
    form: { payments },
    highlight,
  } = useSelector((state) => state.editAdvert);
  function setPayments(payment) {
    dispatch(updateFormData("payments", payment));
  }

  const [isEditing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState(
    "payment-display display-cursor edit-input"
  );

  const handleChange = ({ target }) => {
    if (target.checked) setPayments([...payments, target.value]);
    else setPayments(payments.filter((type) => type !== target.value));
  };

  const typeText = (type) => {
    switch (type) {
      case "boleto":
        return "Boleto";
      case "cartao":
        return "Cartão";
      case "mercadoPago":
        return "Mercado Pago";
      default:
        return "nenhum selecionado";
    }
  };

  const paymentsDisplay = () => {
    return payments.length ? (
      payments.map((type) => (
        <span className="type-name">{typeText(type)}</span>
      ))
    ) : (
      <p>
        <small>Nenhuma forma de pagamento selecionada</small>
      </p>
    );
  };

  useEffect(
    function attentionHandler() {
      if (highlight["payment"]) {
        setDisplayClassName(
          `${displayClassName} is-invalid card-accent-danger highlight rounded`
        );
      }
    },
    //eslint-disable-next-line
    []
  );

  return (
    <div
      className="w-100 edit-input mb-2"
      onMouseEnter={() => setVisibility(true)}
      onMouseLeave={() => setVisibility(false)}
    >
      {isEditing ? (
        <div onBlur={() => setEditing(false)} className="payment-input">
          <p className="mb-1 text-muted">Tipos de pagamentos aceitos:</p>
          <Label className="payment-label">
            <Input
              type="checkbox"
              value="boleto"
              checked={payments.includes("boleto")}
              onChange={handleChange}
              style={{ display: "block" }}
            />{" "}
            Boleto
          </Label>
          <Label className="payment-label">
            <Input
              type="checkbox"
              value="cartao"
              checked={payments.includes("cartao")}
              onChange={handleChange}
            />{" "}
            Cartão
          </Label>
          <Label className="payment-label">
            <Input
              type="checkbox"
              value="mercadoPago"
              checked={payments.includes("mercadoPago")}
              onChange={handleChange}
            />{" "}
            Mercado Pago
          </Label>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} className={displayClassName}>
          <p className="mb-1 text-muted">Tipos de pagamentos aceitos:</p>
          <p className="mb-1">{paymentsDisplay()}</p>
        </div>
      )}
      <div className="m-0 p-0 edit-icon rounded">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default PaymentInput;
