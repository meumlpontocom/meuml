import React, { useContext }     from "react";
import { Label, Input, Select }  from "../atoms";
import PropTypes                 from "prop-types";
import { CCol }                  from "@coreui/react";
import { FaPenFancy, FaBarcode } from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const Tab = ({ isActive, content }) => {
  const { form, setFormData } = useContext(createMlAdvertContext);

  // Correlate selected category's default attributes with category's tree's attributes
  const getAttributeDefaultValue = attributeId => {
    const attributeFromSelectedCategory = form.selectedCategory.attributes.find(attribute => attribute.id === attributeId);
    return attributeFromSelectedCategory?.value_name || "";
  };

  // Update attribute by keyName in attributes in form in createMlAdvertContext.
  const handleInputChange = ({ id, value }) => {
    setFormData({
      id: "attributes",
      value: {
        ...form.attributes,
        [id]: value,
      },
    });
  };

  return isActive && content?.length ?
    content.map(item => (
      <CCol xs="6" className="mt-2" key={item.id}>
        <Label hint={item.hint} htmlFor={item.id}>
          {item.name}
        </Label>
        {item.value_type !== "list" ? (
          <Input
            id={item.id}
            name={item.name}
            defaultValue={getAttributeDefaultValue(item.id)}
            prepend={item.id !== "EAN" ? <FaPenFancy /> : <FaBarcode />}
            type={item.value_type === "string" ? "text" : item.value_type}
            onChange={({ target }) => handleInputChange({ ...target })}
          />
        ) : (
          <Select options={item.values} />
        )}
      </CCol>
    )) : isActive ? (
      <CCol xs="12" className="justify-content-center">
        <p className="text-muted text-center">Nenhum conteúdo disponível.</p>
      </CCol>
    ) : <></>;
};

Tab.propTypes = {
  isActive: PropTypes.bool.isRequired,
  content: PropTypes.array.isRequired,
};

export default Tab;
