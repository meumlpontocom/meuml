import React, { useState, useEffect } from "react";
import Input from "reactstrap/lib/Input";
import EditIcon from "./EditIcon";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import { useSelector, useDispatch } from "react-redux";

const FeaturesInput = () => {
  const dispatch = useDispatch();
  const {
    form: { features },
    highlight,
  } = useSelector((state) => state.editAdvert);

  function setFeatures(features) {
    dispatch(updateFormData("features", features));
  }

  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState("display-cursor");

  useEffect(function () {
    if (highlight["features"]) {
      setDisplayClassName(
        `${displayClassName} is-invalid card-accent-danger highlight rounded`
      );
    }
    //eslint-disable-next-line
  }, []);

  return (
    <div
      className="w-100 edit-input my-2"
      onMouseEnter={() => setVisibility(true)}
      onMouseLeave={() => setVisibility(false)}
    >
      <p className="h3 mb-1">Características</p>
      <Input
        className={displayClassName}
        type="textarea"
        name="features"
        id="features"
        value={features}
        onChange={({ target }) => setFeatures(target.value)}
      />
      <div className="m-0 p-0 edit-icon rounded">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default FeaturesInput;
