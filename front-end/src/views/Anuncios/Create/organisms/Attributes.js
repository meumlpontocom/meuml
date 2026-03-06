import React, { useMemo, useContext, useState, useCallback } from "react";
import { Card, CardHeader }                                  from "../atoms";
import { AttributesNavigation }                              from "../molecules";
import { CCardBody }                                         from "@coreui/react";
import { createMlAdvertContext }                             from "../createMlAdvertContext";

const Attributes = () => {
  const { form, categoryTree, setFormData } = useContext(createMlAdvertContext);
  const shouldRenderComponent = useMemo(() => !!form.availableQuantity, [form.availableQuantity]);
  const [currentAttributeTab, setCurrentAttributeTab] = useState(() => "required" /* required || optional */);

  // attributes = { required: [], optional: [] }.
  const attributes = useMemo(() => {
    const visibleAttributeList = categoryTree.filter(attribute => !attribute.tags["hidden"]);

    return visibleAttributeList.reduce(
      (dictionary, attribute) => {
        if (attribute.tags["required"]) {
          return {
            ...dictionary,
            required: [...dictionary.required, attribute],
          };
        }

        return {
          ...dictionary,
          optional: [...dictionary.optional, attribute],
        };
      },
      { required: [], optional: [] },
    );
  }, [categoryTree]);

  // Used to create always create EAN input config at optional attributes' tab
  const eanConfig = {
    id: "EAN",
    name: "EAN",
    hint: "Código de identificação do seu produto.",
    value_type: "string",
  };

  // Update attribute by keyName in attributes in form in createMlAdvertContext.
  const handleFormInputChange = useCallback(
    ({ id, value, ...rest }) => {
      const newValue = value.match('":')
        ? {
            id,
            value_name: JSON.parse(value).name,
            value_id: JSON.parse(value).id,
          }
        : {
            id,
            value_name: value,
            ...rest,
          };
      setFormData({
        id: "attributes",
        value: [newValue, ...form.attributes.filter(attribute => attribute.id !== id)],
      });
    },
    [form.attributes, setFormData],
  );

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="advert-categories-card">
      <CardHeader title="Atributos" subtitle="Preencha os atributos obrigatórios" />
      <CCardBody>
        <AttributesNavigation
          currentAttributeTab={currentAttributeTab}
          handleFormInputChange={handleFormInputChange}
          setCurrentAttributeTab={setCurrentAttributeTab}
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
      </CCardBody>
    </Card>
  );
};

export default Attributes;
