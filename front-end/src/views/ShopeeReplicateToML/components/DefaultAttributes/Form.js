import React, { useCallback, useContext } from "react";
import { CCol, CRow } from "@coreui/react";
import Title from "./Title";
import AvailableQuantity from "./AvailableQuantity";
import Condition from "./Condition";
import ListingType from "./ListingType";
import Price from "./Price";
import Gtin from "./Gtin";
import ShippingMode from "./ShippingMode";
import SaleTerms from "./SaleTerms";
import FreeShipping from "./FreeShipping";
import Description from "./Description";
import Pictures from "./Pictures";
import Channels from "./Channels";
import ShopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const Form = () => {
  const { setForm } = useContext(ShopeeReplicateToMLContext);
  const updateFormValue = useCallback(
    ({ id, value }) => {
      setForm(current => ({
        ...current,
        basic: {
          ...current.basic,
          [id]: value,
        },
      }));
    },
    [setForm],
  );

  const handleFormChange = useCallback(
    ({ target }) => {
      const priceFormatting = price => price.replace(",", ".");
      updateFormValue({
        id: target.id,
        value:
          target.id !== "pictures"
            ? target.id === "price"
              ? priceFormatting(target.value)
              : target.value
            : target.files,
      });
    },
    [updateFormValue],
  );

  return (
    <CRow className="d-flex align-items-center justify-content-center">
      <CCol xs={10}>
        <CRow>
          <Title handleFormChange={handleFormChange} />
          <AvailableQuantity handleFormChange={handleFormChange} />
          <Condition handleFormChange={handleFormChange} />
          <ListingType handleFormChange={handleFormChange} />
          <Price handleFormChange={handleFormChange} />
          <Gtin handleFormChange={handleFormChange} updateFormValue={updateFormValue} />
          <ShippingMode />
          <SaleTerms />
          <FreeShipping />
          <Description handleFormChange={handleFormChange} />
          <Pictures handleFormChange={handleFormChange} />
          <Channels handleFormChange={handleFormChange} />
        </CRow>
      </CCol>
    </CRow>
  );
};

export default Form;
