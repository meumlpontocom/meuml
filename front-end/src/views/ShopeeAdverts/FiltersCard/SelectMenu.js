import React from "react";
import PropTypes from "prop-types";
import Col from "reactstrap/lib/Col";
import { Picky } from "react-picky";

function SelectMenu({
  xs,
  sm,
  md,
  lg,
  label,
  style,
  multiple,
  options,
  onSelect,
  selected,
  disabled,
  placeholder,
  className,
}) {
  return (
    <Col xs={xs} sm={sm} md={md} lg={lg} style={style}>
      <h4 className="text-primary">{label}</h4>
      <Picky
        onChange={_selected => onSelect(_selected)}
        includeSelectAll={true}
        includeFilter={true}
        dropdownHeight={600}
        multiple={multiple}
        options={options}
        value={selected}
        open={false}
        valueKey="value"
        labelKey="label"
        id="select"
        name="select"
        className={className}
        selectAllText="Selecionar Todos"
        filterPlaceholder="Filtrar por..."
        allSelectedPlaceholder="%s Selecionados"
        manySelectedPlaceholder="%s Selecionados"
        placeholder={placeholder}
        disabled={disabled}
      />
    </Col>
  );
}

SelectMenu.propTypes = {
  xs: PropTypes.string,
  sm: PropTypes.string,
  md: PropTypes.string,
  lg: PropTypes.string,
  label: PropTypes.string,
  style: PropTypes.object,
  multiple: PropTypes.bool,
  options: PropTypes.array,
  onSelect: PropTypes.func,
  selected: PropTypes.array,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default SelectMenu;
