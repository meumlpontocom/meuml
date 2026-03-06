import React, { useCallback, useContext, useEffect } from "react";
import { Input, Label, Select }                      from "../atoms";
import PropTypes                                     from "prop-types";
import { CCol }                                      from "@coreui/react";
import { FaBarcode, FaInfoCircle }                   from "react-icons/fa";
import { createMlAdvertContext }                     from "../createMlAdvertContext";

const AttributeTab = ({ isActive, content, handleInputChange }) => {
  const { form } = useContext(createMlAdvertContext);

  // Correlate selected category's default attributes with category's tree's attributes
  const getAttributeDefaultValue = useCallback(
    attributeId => {
      const attributeFromSelectedCategory = form.selectedCategory.attributes.find(
        attribute => attribute.id === attributeId,
      );

      return attributeFromSelectedCategory?.value_name || "";
    },
    [form.selectedCategory.attributes],
  );

  // if component did mount, handleInputChange forEach content's item using getAttributeDefaultValue
  useEffect(() => {
    content.forEach(item => {
      const itemDefaultValue = getAttributeDefaultValue(item.id);
      if (!form.attributes?.find(i => i.id === item.id)) {
        handleInputChange({
          id: item.id,
          value: itemDefaultValue,
          ...item,
        });
      }
    });
  }, [content, form.attributes, getAttributeDefaultValue, handleInputChange]);

  return isActive && content?.length ? (
    content.map(item => (
      <CCol xs="6" className="mt-2" key={item.id}>
        <Label hint={item.hint} htmlFor={item.id}>
          {item.name}
        </Label>
        {item.value_type !== "list" ? (
          <>
            <Input
              id={item.id}
              name={item.name}
              defaultValue={getAttributeDefaultValue(item.id)}
              prepend={item.id !== "EAN" ? <FaInfoCircle /> : <FaBarcode />}
              type={item.value_type === "string" ? "text" : item.value_type}
              list={item.id}
              datalist={item.values || []}
              onChange={({ target }) => handleInputChange({ id: target.id, value: target.value, ...item })}
            />
          </>
        ) : (
          <Select
            id={item.id}
            name={item.name}
            options={item.values}
            onChangeCallback={({ id, value }) => handleInputChange({ id, value })}
          />
        )}
      </CCol>
    ))
  ) : isActive ? (
    <CCol xs="12" className="justify-content-center">
      <p className="text-muted text-center">Nenhum conteúdo disponível.</p>
    </CCol>
  ) : (
    <></>
  );
};

AttributeTab.propTypes = {
  isActive: PropTypes.bool.isRequired,
  content: PropTypes.array.isRequired,
};

export default AttributeTab;
