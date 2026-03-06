import React from "react";
import {
  Col,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
} from "reactstrap";
import ReactInputMask from "react-input-mask";

export default function FormInput({
  col,
  id,
  name,
  icon,
  type,
  placeholder,
  value,
  onChange,
  label,
  mask,
  showMask,
  className,
  onFocus,
}) {
  return (
    <Col {...col} style={{ marginTop: "2.1em", color: "#bcbcbc" }}>
      <label htmlFor={id}>{label}</label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className={`cil-${icon}`} />
          </InputGroupText>
        </InputGroupAddon>
        <ReactInputMask
          mask={mask}
          value={value[name]}
          onChange={onChange}
          onFocus={onFocus}
          className={className}
          alwaysShowMask={showMask}
        >
          {(inputProps) => (
            <Input
              {...inputProps}
              type={type}
              id={id}
              name={name}
              value={value[name]}
              onFocus={onFocus}
              onChange={onChange}
              placeholder={placeholder}
            />
          )}
        </ReactInputMask>
      </InputGroup>
    </Col>
  );
}
