import React from "react";
import RequiredAttributesSelect from "./RequiredAttributesSelect";
import RequiredAttributesInput from "./RequiredAttributesInput";

export const RequiredAttributesForm = ({ categoryRequiredAttributes }) => {
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
            />
          </div>
        );

      default:
        return (
          <div key={attribute.id}>
            <RequiredAttributesInput id={attribute.id} name={attribute.name} values={attribute.values} />
          </div>
        );
    }
  });
};
