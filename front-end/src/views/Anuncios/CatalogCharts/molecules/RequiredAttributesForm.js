import React, { useCallback, useContext } from "react";
import { catalogChartsContext }           from "../catalogChartsContext";
import RequiredAttributesInput            from "../atoms/RequiredAttributesInput";
import RequiredAttributesSelect           from "../atoms/RequiredAttributesSelect";

export const RequiredAttributesForm = () => {
  const { categoryRequiredAttributes, setRequiredAttributes } = useContext(catalogChartsContext);

  const handleInputChange = useCallback(
    ({ target: { id, value } }) => {
      setRequiredAttributes(
        categoryRequiredAttributes.reduce(
          (previous, current) =>
            current.id === id ? [...previous, { ...current, value }] : [...previous, current],
          [],
        ),
      );
    },
    [categoryRequiredAttributes, setRequiredAttributes],
  );

  return categoryRequiredAttributes.map((attribute, index) => {
    switch (attribute.value_type) {
      case "list":
        return (
          <div key={attribute.id}>
            <RequiredAttributesSelect
              id={attribute.id}
              index={index}
              name={attribute.name}
              values={attribute.values}
              handleInputChange={handleInputChange}
            />
          </div>
        );

      default:
        return (
          <div key={attribute.id}>
            <RequiredAttributesInput  
              id={attribute.id}
              name={attribute.name}
              values={attribute.values}
              handleInputChange={handleInputChange}
            />
          </div>
        );
    }
  });
};
