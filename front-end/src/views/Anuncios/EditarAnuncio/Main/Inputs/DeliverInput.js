import React, { useState, useEffect } from "react";

//Reactstrap
import Input from "reactstrap/lib/Input";

//Stylesheet and custom components
import EditIcon from "./EditIcon";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import { useSelector, useDispatch } from "react-redux";

const DeliverInput = () => {
  const dispatch = useDispatch();
  const {
    form: { shipping_tags },
    highlight,
  } = useSelector((state) => state.editAdvert);

  function setShippingTags(shippingTags) {
    dispatch(updateFormData("shipping_tags", shippingTags));
  }

  const [isEditing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState(
    "deliver-display display-cursor"
  );

  const deliverDisplayText = () => {
    switch (shipping_tags) {
      case "retirada":
        return (
          <p>
            <i className="cil-walk mr-2" />
            Retirada
          </p>
        );
      case "envioMercado":
        return (
          <p>
            <i className="fa fa-truck mr-2" />
            Envio mercado
          </p>
        );
      case "correios":
        return (
          <p>
            <i className="fa fa-envelope mr-2" />
            Correios
          </p>
        );
      default:
        return "nenhum método selecionado";
    }
  };

  const deliverDisplay = () => {
    return shipping_tags.length ? (
      deliverDisplayText()
    ) : (
      <p style={{ color: "var(--info)" }}>
        <small>Nenhum método de entrega selecionado</small>
      </p>
    );
  };

  useEffect(() => {
    if (highlight["shipping_tags"]) {
      setDisplayClassName(
        `${displayClassName} is-invalid card-accent-danger highlight rounded`
      );
    }
    //eslint-disable-next-line
  }, []);

  return (
    <div
      className="w-100 edit-input"
      onMouseEnter={() => setVisibility(true)}
      onMouseLeave={() => setVisibility(false)}
    >
      {isEditing ? (
        <div onBlur={() => setEditing(false)} className="deliver-input">
          <Input
            type="select"
            name="selectDeliver"
            id="selectDeliver"
            className="deliver-input"
            value={shipping_tags}
            onInput={({ target }) => setShippingTags(target.value)}
          >
            <option value="" disabled></option>
            <option value="retirada">Retirada</option>
            <option value="envioMercado">Envio Mercado</option>
            <option value="correios">Correios</option>
          </Input>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} className={displayClassName}>
          <p className="mb-1 text-muted">Métodos de entrega:</p>
          {deliverDisplay()}
        </div>
      )}
      <div className="m-0 p-0 edit-icon rounded ">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default DeliverInput;
