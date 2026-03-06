import React, { useContext, useMemo } from "react";
import { CCol } from "@coreui/react";
import { FaBoxes } from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const DisplayAvailableQuantity = () => {
  const { form, selectedVariationId } = useContext(createMlAdvertContext);
  const isDisplayingVariationData = useMemo(() => selectedVariationId !== "default", [selectedVariationId]);

  const availableQuantity = useMemo(() => {
    if (isDisplayingVariationData) {
      const variation = form.variations.find(variation => variation._id === selectedVariationId);
      return variation.availableQuantity;
    }

    return form.availableQuantity;
  }, [form.availableQuantity, form.variations, isDisplayingVariationData, selectedVariationId]);

  return (
    <CCol xs="12" sm="6" md="4">
      <h5>
        <strong>
          <FaBoxes className={`mr-2 text-${isDisplayingVariationData ? "danger" : "primary"}`} />
          Quantidade:&nbsp;
        </strong>
        {availableQuantity}
      </h5>
    </CCol>
  );
};

export default DisplayAvailableQuantity;
