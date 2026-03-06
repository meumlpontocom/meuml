import React, { useContext, useMemo } from "react";
import Col from "reactstrap/lib/Col";
import Label from "reactstrap/lib/Label";
import { InputGroup, InputGroupAddon, InputGroupText } from "reactstrap";

export default function CollapseCardWithSelect({
  context,
  attribute,
  variation = false,
}) {
  const { updateFormData, formData } = useContext(context);

  const selected = useMemo(() => {
    const key = attribute.name + "/" + attribute.id;
    if (formData && formData[key]) return formData[key]?.id || formData[key];
    else return "";
  }, [formData, attribute]);

  return (
    <Col xs={12} sm={12} md={12} lg={12} className="mb-3">
      <Label>{attribute.name}</Label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-caret-right" />
          </InputGroupText>
        </InputGroupAddon>
        <select
          className="custom-select"
          value={selected}
          onChange={({ target: { name, id, value } }) =>
            updateFormData({ param: `${name}/${id}`, value, variation })
          }
          id={attribute.id}
          name={attribute.name}
        >
          <option name="null" value={false}>
            Selecione uma opção valida
          </option>
          {attribute.values.map((value, index) => (
            <option
              key={index}
              value={JSON.stringify({ name: value.name, id: value.id })}
            >
              {value.name}
            </option>
          ))}
        </select>
      </InputGroup>
    </Col>
  );
}
