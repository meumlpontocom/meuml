import React, { useContext, useEffect, useRef } from "react"
import {
  CCol,
  CRow,
  CCarousel,
  CCarouselItem,
  CCarouselInner,
  CCarouselControl,
} from "@coreui/react";
import UpdateAdvertContext from "../UpdateAdvert.Context";

function Carousel() {
  const { pictures, updateActiveIndex, activeIndex } = useContext(UpdateAdvertContext);
  const previousPicture = useRef(null);
  const nextPicture = useRef(null);

  useEffect(() => {
    if (previousPicture.current.classList && nextPicture.current.classList) {
      previousPicture.current.classList = ["btn btn-dark btn-sm mt-2"];
      nextPicture.current.classList = ["btn btn-dark btn-sm mt-2"];
    }
    return () => {
      previousPicture.current = null;
      nextPicture.current = null;
    }
  }, [previousPicture, nextPicture]);

  return (
    <CCarousel
      default={false}
      activeIndex={activeIndex}
      onSlideChange={current => updateActiveIndex(current)}
    >
      <CCarouselInner>
        {pictures.map((picture, index) => {
          return (
            <CCarouselItem style={{ height: "230px" }} key={index}>
              <img
                id={picture.id}
                name={`picture-${index}`}
                height={200}
                src={picture.secure_url}
                alt={`Imagem nº ${index}`}
              />
            </CCarouselItem>
          );
        })}
      </CCarouselInner>
      <CRow className="align-items-center">
        <CCol lg={2}>
          <CCarouselControl innerRef={previousPicture} direction="prev" />
        </CCol>
        <CCol className="col-xs-auto">
          <div className="d-flex flex-row carousel-preview">
            {pictures.map((picture, index) => {
              return (
                <CCol key={index} xs={4} sm={4} md={3} className="mt-2">
                  <img
                    onClick={() => updateActiveIndex(index)}
                    className={`pointer ${activeIndex === index ? "selected-img" : "default-img"}`}
                    width={40}
                    alt={`Imagem nº ${index}`}
                    name={`picture-${index}`}
                    src={picture.secure_url}
                    id={picture.id}
                  />
                </CCol>
              );
            })}
          </div>
        </CCol>
        <CCol lg={2}>
          <CCarouselControl innerRef={nextPicture} direction="next" />
        </CCol>
      </CRow>
    </CCarousel>
  )
}

export default Carousel;
