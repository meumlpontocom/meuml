import React, { useState, useEffect } from "react";
import Input from "reactstrap/lib/Input";
import EditIcon from "./EditIcon";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import { useSelector, useDispatch } from "react-redux";

const QuantityInput = () => {
  const dispatch = useDispatch();
  const {
    advertData,
    form: { available_quantity },
    highlight,
  } = useSelector((state) => state.editAdvert);
  function setAvailableQuantity(available) {
    dispatch(updateFormData("available_quantity", available));
  }
  const [isEditing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState(
    "quantity-display display-cursor"
  );

  useEffect(function attentionHandler() {
    if (highlight["available_quantity"]) {
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
        <div onBlur={() => setEditing(false)}>
          <p className="quantity-value">
            <span className="d-block text-muted">Quantidade disponível</span>
          </p>
          <Input
            type="number"
            min="1"
            step="1"
            name="quantity"
            id="stockQuantity"
            placeholder=""
            value={available_quantity}
            onChange={(event) => setAvailableQuantity(event.target.value)}
          />
        </div>
      ) : (
        <div onClick={() => setEditing(true)} className={displayClassName}>
          <p className="mb-1 text-muted">Quantidade em estoque:</p>

          <p className="quantity-value">
            {!available_quantity
              ? advertData?.available_quantity
              : available_quantity}
          </p>
        </div>
      )}
      <div className="m-0 p-0 edit-icon rounded">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default QuantityInput;
