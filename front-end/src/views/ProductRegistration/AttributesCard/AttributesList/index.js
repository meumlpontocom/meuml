import React, { useContext }          from "react";
import SingleAttribute                from "./SingleAttribute";
import { ProductRegistrationContext } from "../../ProductRegistrationContext";

const AttributesList = () => {
  const { productAttributesList } = useContext(ProductRegistrationContext);
  if (!productAttributesList) {
    return null;
  }
  return (
    <div className="mt-3" style={{ maxHeight: "330px", overflowY: "auto", scrollBehavior: "smooth" }}>
      {productAttributesList.map((attribute) => {
        return (
          <SingleAttribute
            key={attribute.id}
            id={attribute.id}
            name={attribute.field}
            value={attribute.value}
          />
        );
      })}
    </div>
  );
};

export default AttributesList;
