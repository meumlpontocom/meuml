import React, { useState, useEffect } from "react";
import Input from "reactstrap/lib/Input";
import EditIcon from "./EditIcon";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import { useSelector, useDispatch } from "react-redux";

const TitleInput = () => {
  const dispatch = useDispatch();
  const {
    advertData,
    form: { title },
    highlight,
  } = useSelector((state) => state.editAdvert);
  function setTitle(title) {
    dispatch(updateFormData("title", title));
  }
  const [isEditing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState(
    "h2 font-weight-bold title-display mb-0 py-2 display-cursor"
  );

  useEffect(function () {
    if (highlight["title"]) {
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
      style={{ minHeight: "56px" }}
    >
      {isEditing ? (
        <div onBlur={() => setEditing(false)} className="title-input">
          <Input
            type="text"
            name="selectCondition"
            id="selectCondition"
            value={title.value}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
      ) : (
        <div onClick={() => setEditing(true)} className={displayClassName}>
          <p className="p-0 m-0">{!title ? advertData?.title : title}</p>
        </div>
      )}
      <div className="m-0 p-0 edit-icon rounded">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default TitleInput;
