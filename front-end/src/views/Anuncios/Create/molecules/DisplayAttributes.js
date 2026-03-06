import React, { useContext, useMemo }                   from "react";
import { CustomSection, AttributeCallout }              from "../atoms";
import { CRow }                                         from "@coreui/react";
import { createMlAdvertContext }                        from "../createMlAdvertContext";

const DisplayAttributes = () => {
  const { form, selectedVariationId } = useContext(createMlAdvertContext);
  const isDisplayingVariationData = useMemo(() => selectedVariationId !== "default", [selectedVariationId]);

  const selectedVariationAttributes = useMemo(() => {
    const selectedVariation = form.variations.find(variation => variation._id === selectedVariationId);
    return selectedVariation?.attributes ? Object.values(selectedVariation.attributes) : [];
  }, [form.variations, selectedVariationId]);

  const attributes = useMemo(() => {
    const appendColorForEachObjectOfList = ({ list = [], color = "info" }) =>
      list.map(object => ({
        ...object,
        color,
      }));

    return isDisplayingVariationData
      ? [
          ...appendColorForEachObjectOfList({ list: form.attributes }),
          ...appendColorForEachObjectOfList({ list: selectedVariationAttributes, color: "danger" }),
        ].reduce((attributeList, currentTest) => {
          const removeItemFromList = (idToRemove, list) => list.filter(({ id }) => id !== idToRemove);
          const foundAttributeOnList = !!attributeList.find(attribute => attribute.id === currentTest.id);

          if (foundAttributeOnList)
            return currentTest.color === "danger"
              ? [...removeItemFromList(currentTest.id, attributeList), currentTest]
              : attributeList;
          else return [...attributeList, currentTest];
        }, [])
      : appendColorForEachObjectOfList({ list: form.attributes });
  }, [form.attributes, isDisplayingVariationData, selectedVariationAttributes]);

  return (
    <CustomSection id="advert-attributes" header="Características">
      <CRow>
        {attributes.map(attribute => (
          <AttributeCallout
            label={attribute.name}
            color={attribute.color}
            value={attribute.value_name}
            key={attribute.id}
            id={attribute.id}
          />
        ))}
      </CRow>
    </CustomSection>
  );
};

export default DisplayAttributes;
