import React, { useState, useEffect } from "react";
import Input from "reactstrap/lib/Input";
import EditIcon from "./EditIcon";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import { useSelector, useDispatch } from "react-redux";

const DescriptionInput = () => {
  const dispatch = useDispatch();
  const {
    advertData,
    form: { description },
    highlight,
  } = useSelector((state) => state.editAdvert);
  function setDescription(inputValue) {
    dispatch(updateFormData("description", { plain_text: inputValue }));
  }
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState("display-cursor");

  useEffect(function attentionHandler() {
    if (highlight["description"]) {
      setDisplayClassName(
        `${displayClassName} is-invalid card-accent-danger highlight rounded`
      );
    }
    //eslint-disable-next-line
  }, []);

  return (
    <div
      onMouseEnter={() => setVisibility(true)}
      onMouseLeave={() => setVisibility(false)}
    >
      <p className="h3 mb-1">Descrição</p>
      <Input
        className={displayClassName}
        type="textarea"
        name="description"
        id="description"
        value={
          !description
            ? advertData?.description?.plain_text
            : description.plain_text
        }
        onChange={({ target }) => setDescription(target.value)}
      />
      <div className="m-0 p-0 edit-icon rounded">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default DescriptionInput;
