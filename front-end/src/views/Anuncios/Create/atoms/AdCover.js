import React, { useContext, useMemo } from "react";
import { CCol, CImg } from "@coreui/react";
import { createMlAdvertContext } from "../createMlAdvertContext";

const AdCover = () => {
  const { form, selectedVariationId } = useContext(createMlAdvertContext);

  const isDisplayingVariationData = useMemo(() => selectedVariationId !== "default", [selectedVariationId]);

  const fileObject = useMemo(() => {
    if (isDisplayingVariationData) {
      const variation = form.variations.find(variation => variation._id === selectedVariationId);
      return variation.images[0];
    }

    return form.images[0];
  }, [form.images, form.variations, isDisplayingVariationData, selectedVariationId]);

  return (
    <CCol md="5" style={{ paddingLeft: "20px", paddingTop: "20px" }}>
      <CImg
        src={URL.createObjectURL(fileObject)}
        alt="Capa do anúncio"
        className="card-img"
        width="100%"
        height="100%"
      />
    </CCol>
  );
};

export default AdCover;
