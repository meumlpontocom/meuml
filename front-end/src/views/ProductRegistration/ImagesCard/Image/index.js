import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CCard, CCardBody }         from "@coreui/react";
import { setProductMainImage }      from "src/redux/actions/_newProductActions";
import { useHistory }               from "react-router-dom";
import ImageCard                    from "./ImageCard";

const Image = ({ id, name, url }) => {
  const dispatch = useDispatch();
  const { location } = useHistory();
  const dataBroughtThroughRedirection = location.state?.item?.images;
  const [hasClickedOnce, setHasClickedOnce] = useState(() => null);
  const isProductsCurrentMainImage = dataBroughtThroughRedirection?.filter(img => img.id === id)[0]?.is_main_image || false;
  const selectedImageList = useSelector(state => state.newProduct.images.selectedImages);
  const mainImageID = useSelector(state => state.newProduct.images.mainImageID);
  const setMainImage = imageID => dispatch(setProductMainImage(imageID));

  const checkedAsMainImage = useMemo(() => {
    if (hasClickedOnce) return Number(mainImageID) === Number(id);
    return isProductsCurrentMainImage || Number(mainImageID) === Number(id)
  }, [hasClickedOnce, id, isProductsCurrentMainImage, mainImageID]);

  const currentlySetAsProductImage = dataBroughtThroughRedirection?.length
    ? !!dataBroughtThroughRedirection.filter(img => img.id === id)[0]
    : false;

  const selectionStyle = useMemo(() =>
      currentlySetAsProductImage || selectedImageList[id]
        ? "card-accent-primary"
        : ""
    , [currentlySetAsProductImage, id, selectedImageList],
  );

  return (
    <CCard name={id + "-card"} className={"ml-3 " + selectionStyle} style={{ width: "250px", height: "350px" }}>
      <ImageCard
        hasClickedOnce={hasClickedOnce}
        setHasClickedOnce={setHasClickedOnce}
        currentlySetAsProductImage={currentlySetAsProductImage}
        id={id}
        name={name}
        url={url}
      />
      <CCardBody>
        <p className="card-text"><strong className="text-info">Arquivo:</strong>&nbsp;{name}</p>
        <p className="card-text">
          <strong className="text-info">Principal?</strong>&nbsp;
          <input
            id={id}
            type="checkbox"
            name="main-image"
            checked={checkedAsMainImage}
            onChange={event => setMainImage(event.target.id)}
          />
        </p>
      </CCardBody>
    </CCard>
  );
}

export default Image;
