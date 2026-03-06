import React, { useState, useMemo, useContext, useCallback } from "react";
import { CLabel }                                            from "@coreui/react";
import AttributesNavigation                                  from "../molecules/AttributesNavigation";
import { createMlAdvertContext }                             from "../createMlAdvertContext";

const VariationAttributes = ({ setFormData, variationForm }) => {
  const { categoryTree } = useContext(createMlAdvertContext);
  const [currentAttributeTab, setCurrentAttributeTab] = useState(() => "required" /* required || optional */);

  // attributes = { required: [], optional: [] }.
  const attributes = useMemo(() => {
    const visibleAttributes = categoryTree.filter(
      attribute => !attribute.tags["hidden"],
    );

    const allowedAttributesForVariations = visibleAttributes.filter(
      attribute => !attribute.tags["allow_variations"],
    );

    return allowedAttributesForVariations.reduce((dictionary, attribute) => {
      if (attribute.tags["required"]) {
        return {
          ...dictionary,
          required: [...dictionary.required, attribute],
        };
      }

      return {
        ...dictionary,
        optional: [...dictionary.optional],
      };
    }, { required: [], optional: [] });
  }, [categoryTree]);

  // Used to create always create EAN input config at optional attributes' tab
  const eanConfig = {
    id: "EAN",
    name: "EAN",
    hint: "Código de identificação do seu produto.",
    value_type: "string",
  };

  // Update attribute by keyName in attributes in form in createMlAdvertContext.
  const handleFormInputChange = useCallback(({ id, value, ...rest }) => {
    setFormData({ id: "attributes", value: {
      ...variationForm.attributes,
        [id]: { id, value_name: value, ...rest }
    }});
  }, [setFormData, variationForm.attributes]);

  return (
    <>
      <CLabel>Atributos</CLabel>
      <AttributesNavigation
        currentAttributeTab={currentAttributeTab}
        handleFormInputChange={handleFormInputChange}
        navCallback={index => setCurrentAttributeTab(index === 0 ? "required" : "optional")}
        tabs={[
          {
            id: "required",
            isActive: currentAttributeTab === "required",
            content: attributes.required,
          },
          {
            id: "optional",
            isActive: currentAttributeTab === "optional",
            content: [eanConfig, ...attributes.optional],
          },
        ]}
      />
    </>
  );
};

export default VariationAttributes;
