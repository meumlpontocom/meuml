import React, { useContext }     from "react";
import { CustomSection }         from "../atoms";
import formatMoney               from "../../../../helpers/formatMoney";
import { createMlAdvertContext } from "../createMlAdvertContext";

const TitleAndPriceSection = () => {
  const { form } = useContext(createMlAdvertContext);
  return (
    <CustomSection id="title-and-price">
      <h2>
        <span className="text-info">{form.title}</span>&nbsp;
        <strong>{formatMoney(form.price)}</strong>
      </h2>
    </CustomSection>
  );
};

export default TitleAndPriceSection;
