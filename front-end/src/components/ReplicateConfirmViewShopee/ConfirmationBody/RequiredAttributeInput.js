import React from "react";
import { Input } from "reactstrap";
import { Picky } from "react-picky";

export const RequiredAttributeInput = React.memo(function RequiredAttributeInput({
  attribute,
  onChangeText,
  onChangeSelect,
}) {
  const handleTextChange = ({ target: { value } }) => {
    onChangeText(attribute, value);
  };

  const handleSelectChange = selected => {
    onChangeSelect(attribute, selected);
  };

  const childAttributes =
    attribute.values_list
      ?.filter(v => v.selected && v.children && v.children.length)
      .flatMap(v => v.children) ?? [];

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <div>
        <label>{attribute.name}</label>
        <div style={{ width: "250px" }}>
          {attribute.type === "text" ? (
            <Input type="text" value={attribute.value ?? ""} onChange={handleTextChange} />
          ) : (
            <Picky
              onChange={handleSelectChange}
              includeSelectAll={attribute.type === "multiple"}
              includeFilter={true}
              dropdownHeight={600}
              multiple={attribute.type === "multiple"}
              options={attribute.values_list.map(value => ({
                label: value.name,
                value: value.id,
              }))}
              value={attribute.value}
              open={false}
              valueKey="value"
              labelKey="label"
              id={`required-attribute-${attribute.id}`}
              name={`required-attribute-${attribute.id}`}
              className="multiSelBlockUser"
              selectAllText="Selecionar Todos"
              filterPlaceholder="Filtrar por..."
              allSelectedPlaceholder="%s Selecionados"
              manySelectedPlaceholder="%s Selecionados"
              placeholder="Selecione uma opção"
              disabled={false}
            />
          )}
        </div>
      </div>

      {childAttributes.map(child => (
        <RequiredAttributeInput
          key={child.id}
          attribute={child}
          onChangeText={onChangeText}
          onChangeSelect={onChangeSelect}
        />
      ))}
    </div>
  );
});
