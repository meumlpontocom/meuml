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

export default function Main({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

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
              captionText={item.caption}
              captionHeader={item.caption}
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
      <DeleteCurrentPictureButton activeIndex={activeIndex} items={items} />
      <AddNewPictureButton items={items} />
      <Carousel activeIndex={activeIndex} next={next} previous={previous}>
        <CarouselIndicators
          items={items}
          activeIndex={activeIndex}
          onClickHandler={goToIndex}
        />
        {slides}
      </Carousel>
      <IndexControlButtons previous={previous} next={next} items={items} />
    </>
  ) : (
    <p className="text-muted">Este anúncio não possui imagens.</p>
  );
}
