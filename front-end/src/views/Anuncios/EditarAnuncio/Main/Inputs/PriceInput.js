import React, { useState, useEffect } from "react";
import Input from "reactstrap/lib/Input";
import EditIcon from "./EditIcon";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import { useSelector, useDispatch } from "react-redux";
import formatMoney from "../../../../../helpers/formatMoney";

const PriceInput = () => {
  const dispatch = useDispatch();
  const {
    form: { price },
    advertData,
    highlight,
  } = useSelector((state) => state.editAdvert);
  function setPrice(price) {
    dispatch(updateFormData("price", price));
  }
  const [isEditing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState("h2 display-cursor");

  useEffect(function () {
    if (highlight["price"]) {
      setDisplayClassName(
        `${displayClassName} is-invalid card-accent-danger highlight rounded`
      );
    }
    //eslint-disable-next-line
  }, []);

  return (
    <div
      className="w-100 edit-input mb-1"
      onMouseEnter={() => setVisibility(true)}
      onMouseLeave={() => setVisibility(false)}
      style={{ minHeight: "54px" }}
    >
      {isEditing ? (
        <div onBlur={() => setEditing(false)} className="price-input">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            name="price"
            id="itemPrice"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
      ) : (
        <div onClick={() => setEditing(true)} className={displayClassName}>
          <p className="mb-0">
            {!price ? formatMoney(advertData?.price) : formatMoney(price)}
          </p>
        </div>
      )}
      <div className="m-0 p-0 edit-icon rounded">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default PriceInput;
