import React, { useState } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselIndicators,
  CarouselCaption,
} from "reactstrap";
import {
  IndexControlButtons,
  DeleteCurrentPictureButton,
  AddNewPictureButton,
} from "./carouselBtns";
import ImagesStrip from "./imagesStrip";
import VideoInput from "./videoInput";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  updateFormData,
} from "../../../../../../redux/actions/_editAdvertActions";

export default function Main({ items, accountId }) {
  const dispatch = useDispatch();
  const {
    advertData,
    form: { pictures = [] },
  } = useSelector((state) => state.editAdvert);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const createNewImageList = (newPictureObject) => {
    if (advertData.pictures?.length && !pictures.length)
      return [...advertData.pictures, newPictureObject];
    else if (pictures.length) return [...pictures, newPictureObject];
    else return [newPictureObject];
  };

  const deleteImage = (imageIndex) => {
    if (pictures.length) {
      return pictures.filter((object, index) => index !== imageIndex);
    }

    return advertData.pictures.filter((object, index) => index !== imageIndex);
  };

  const handleDeleteImageCallback = (imageIndex) =>
    dispatch(updateFormData("pictures", deleteImage(imageIndex)));

  const handleImageLoadingCallback = (isLoading) =>
    dispatch(setLoading(isLoading));

  const createImageDefaultObject = (pictureId) => ({
    id: pictureId,
    secure_url: `https://mlb-s2-p.mlstatic.com/${pictureId}`,
  });

  const handleImageIdCallback = (newPictureId) =>
    dispatch(
      updateFormData(
        "pictures",
        createNewImageList(createImageDefaultObject(newPictureId))
      )
    );

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const slides = items?.length
    ? items.map((item) => {
        return (
          <CarouselItem
            className="custom-tag text-center"
            onExiting={() => setAnimating(true)}
            onExited={() => setAnimating(false)}
            key={item.src}
          >
            <img width="150" src={item.src} alt={item.altText} />
            <CarouselCaption
              captionHeader={item.captionHeader}
              captionText={item.captionText}
            />
          </CarouselItem>
        );
      })
    : [];
  return items?.length ? (
    <>
      <style>
        {`.custom-tag {
              width: 200px;
              height: 200px;
              font-size: 14px;
              background: white;
            }`}
      </style>
      <DeleteCurrentPictureButton
        deleteImageCallback={(index) => handleDeleteImageCallback(index)}
        activeIndex={activeIndex}
        items={items}
      />
      <AddNewPictureButton
        setNewPictureIdCallback={(newPictureId) =>
          handleImageIdCallback(newPictureId)
        }
        setIsLoadingCallback={(isLoading) =>
          handleImageLoadingCallback(isLoading)
        }
        accountIdFromOtherViews={accountId}
        items={items}
      />
      <div className="d-flex flex-wrap justify-content-center">
        <Carousel activeIndex={activeIndex} next={next} previous={previous}>
          <CarouselIndicators
            items={items}
            activeIndex={activeIndex}
            onClickHandler={goToIndex}
          />
          {slides}
        </Carousel>
      </div>
      <IndexControlButtons previous={previous} next={next} items={items} />
      <ImagesStrip items={items} />
      <VideoInput />
    </>
  ) : (
    <p className="text-muted">Este anúncio não possui imagens.</p>
  );
}
