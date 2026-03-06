import React from "react";
import Input from "reactstrap/lib/Input";
import { useDispatch, useSelector } from "react-redux";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import EditIcon from "./EditIcon";

function Gtin() {
  const dispatch = useDispatch();
  const { highlight } = useSelector(({ editAdvert }) => editAdvert);
  const [isMouseOver, setIsMouseOver] = React.useState(false);

  function handleChange({ target: { id, value } }) {
    dispatch(updateFormData(id, value));
  }

  function hoverEffectIn() {
    setIsMouseOver(true);
  }
  function hoverEffectOut() {
    setIsMouseOver(false);
  }

  const hasRedBorders = React.useMemo(() => {
    return highlight["product_identifiers"]
      ? `display-cursor is-invalid card-accent-danger highlight rounded`
      : "";
  }, [highlight]);

  return (
    <div onMouseEnter={hoverEffectIn} onMouseLeave={hoverEffectOut}>
      <p className="h3 mb-1">Código universal do produto</p>
      <Input
        id="gtin"
        name="gtin-input"
        type="text"
        onChange={handleChange}
        className={`col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ${hasRedBorders}`}
      />
      <div className="m-0 p-0 edit-icon rounded">
        {isMouseOver && <EditIcon />}
      </div>
    </div>
  );
}

export default Gtin;
