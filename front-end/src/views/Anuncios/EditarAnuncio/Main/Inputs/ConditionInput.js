import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import "./styles.scss";
import Input from "reactstrap/lib/Input";
import EditIcon from "./EditIcon";

const ConditionInput = () => {
  const dispatch = useDispatch();
  const {
    advertData,
    highlight,
    form: { condition },
  } = useSelector((state) => state.editAdvert);
  const [isEditing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState(
    "condition-display my-2 display-cursor"
  );

  useEffect(() => {
    if (highlight["condition"]) {
      const classNameString = "is-invalid card-accent-danger highlight rounded";
      setDisplayClassName(`${displayClassName} ${classNameString}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInputValueUpdate({ target }) {
    dispatch(updateFormData("condition", target.value));
  }

  return (
    <div
      className="w-100 edit-input"
      onMouseEnter={() => setVisibility(true)}
      onMouseLeave={() => setVisibility(false)}
    >
      {isEditing ? (
        <div onBlur={() => setEditing(false)}>
          <Input
            value={condition}
            type="select"
            name="selectCondition"
            id="condition"
            className="condition-input"
            onChange={handleInputValueUpdate}
          >
            <option value="new">Novo</option>
            <option value="used">Usado</option>
          </Input>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} className={displayClassName}>
          <span className="mb-1 text-muted adtype-display">
            Condição do produto:
          </span>
          <p className="mb-0">
            {!condition
              ? translateCondition(advertData?.condition)
              : translateCondition(condition)}
          </p>
        </div>
      )}
      <div className="m-0 p-0 edit-icon rounded">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default ConditionInput;

const translateCondition = (condition) =>
  condition === "used"
    ? "Usado"
    : condition === "new"
    ? "Novo"
    : "Não especificado";
