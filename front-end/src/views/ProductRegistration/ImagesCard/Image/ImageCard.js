import React, { useCallback, useEffect, useState } from "react";
import PropTypes                                   from "prop-types";
import { useDispatch, useSelector }                from "react-redux";
import { setToggleSelectImage }                    from "src/redux/actions/_newProductActions";
import { CCardHeader }                             from "@coreui/react";

const CardImage = ({ name, url, id, currentlySetAsProductImage, hasClickedOnce, setHasClickedOnce }) => {
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(() => false);

  function handleChange() {
    setIsChecked(!isChecked);
  }

  const handleImageCardClick = useCallback(() => {
    setHasClickedOnce(true);
    dispatch(setToggleSelectImage(id));
  }, [dispatch, id, setHasClickedOnce]);

  const isGloballySelected = useSelector(state => state.newProduct.images.selectedImages[id]);

  useEffect(() => {
    if (hasClickedOnce) setIsChecked(isGloballySelected);
    else if (currentlySetAsProductImage) {
      handleImageCardClick();
      setIsChecked(currentlySetAsProductImage);
    } else setIsChecked(isGloballySelected);
  }, [currentlySetAsProductImage, handleImageCardClick, hasClickedOnce, isGloballySelected]);

  return (
    <CCardHeader
      onClick={handleImageCardClick}
      style={{ height: "290px", position: "relative" }}
      className="d-flex align-items-center justify-content-center pointer"
    >
      <input
        onChange={handleChange}
        type="checkbox"
        checked={isChecked}
        style={{ position: "absolute", top: "10px", left: "10px" }}
      />
      <img id={id} alt={name} className="card-img-top" src={url?.search("https://") > -1 ? url : `https://${url}`} />
    </CCardHeader>
  );
}

CardImage.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  currentlySetAsProductImage: PropTypes.bool.isRequired,
  hasClickedOnce: PropTypes.any,
  setHasClickedOnce: PropTypes.func.isRequired,
};

export default CardImage;
