import React, { useState, useEffect } from "react";
import Input from "reactstrap/lib/Input";
import EditIcon from "./EditIcon";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import { useSelector, useDispatch } from "react-redux";
import getListingTypes from "../../../../../helpers/getListingTypes";

const AdType = () => {
  const dispatch = useDispatch();
  const {
    advertData,
    form: { listing_type_id },
    highlight,
  } = useSelector((state) => state.editAdvert);

  function setAdType(type) {
    dispatch(updateFormData("listing_type_id", type));
  }

  const [isEditing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [displayClassName, setDisplayClassName] = useState(
    "adtype-display display-cursor"
  );

  useEffect(function attentionHandler() {
    if (highlight["premium"]) {
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
        <div onBlur={() => setEditing(false)} className="adtype-input">
          <Input
            value={listing_type_id}
            type="select"
            name="selectAdType"
            id="premium"
            onChange={({ target }) => setAdType(target.value)}
          >
            <option value="gold_special">Clássico</option>
            <option value="gold_pro">Premium</option>
          </Input>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} className={displayClassName}>
          <p className="mb-1 text-muted">Tipo do anúncio:</p>
          <p>
            {!listing_type_id
              ? getListingTypes(advertData?.listing_type_id)
              : getListingTypes(listing_type_id)}
          </p>
        </div>
      )}
      <div className="m-0 p-0 edit-icon rounded color-info">
        {visibility && <EditIcon />}
      </div>
    </div>
  );
};

export default AdType;
