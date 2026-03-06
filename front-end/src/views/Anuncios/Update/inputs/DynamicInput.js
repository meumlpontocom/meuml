/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import CIcon from "@coreui/icons-react";
import {
  CLabel,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupAppend,
  CInputGroupText,
  CCol,
  CSelect,
  CTextarea,
} from "@coreui/react";
import NumberFormat from "react-number-format";

function DynamicInput({ label, type, id, name, columns, icon, defaultValue, context }) {
  const { saveAdvertMainInfo } = useContext(context);

  const ref = useRef(null);

  useEffect(() => {
    saveAdvertMainInfo(ref);
  }, []);

  const defaultOptions = {
    type,
    defaultValue,
    innerRef: ref,
    id: id || `${label}-input-component`,
    name: name || `${label}-input-component`,
  };

  const InputContainer = ({ children, undo = true }) => {
    function undoInputValueUpdate() {
      let { value } = ref.current;
      if (undo && value !== defaultValue) {
        ref.current.value = defaultValue;
      }
    }

    return (
      <CCol {...columns} className="mb-2">
        <CLabel>{label}</CLabel>
        <CInputGroup>
          <CInputGroupPrepend>
            <CInputGroupText>
              <CIcon name={icon} />
            </CInputGroupText>
          </CInputGroupPrepend>
          {children}
          <CInputGroupAppend className="pointer" onClick={undoInputValueUpdate}>
            <CInputGroupText>{undo && <CIcon name="cil-action-undo" />}</CInputGroupText>
          </CInputGroupAppend>
        </CInputGroup>
      </CCol>
    );
  };

  const [currentFloatValue, setfloatValue] = useState(() => defaultValue);

  switch (name) {
    case "sale_terms_manufacturing_time":
      return (
        <InputContainer>
          <CInput type="number" {...defaultOptions} placeholder="Número" />
          <CInput type="text" disabled value="dia(s)" />
        </InputContainer>
      );

    case "description":
      return (
        <InputContainer>
          <CTextarea {...defaultOptions} rows="20" />
        </InputContainer>
      );

    case "status":
      return (
        <InputContainer>
          <CSelect {...defaultOptions}>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="closed">Finalizado</option>
          </CSelect>
        </InputContainer>
      );

    case "condition":
      return (
        <InputContainer>
          <CSelect {...defaultOptions}>
            <option value="new">Novo</option>
            <option value="used">Usado</option>
          </CSelect>
        </InputContainer>
      );

    case "sale_terms_warranty_time":
      return (
        <InputContainer>
          <CInput {...defaultOptions} />
          <CSelect>
            <option value="dias">Dia(s)</option>
            <option value="meses">Mes(es)</option>
            <option value="anos">Ano(s)</option>
          </CSelect>
        </InputContainer>
      );

    case "sale_terms_warranty_type":
      return (
        <InputContainer>
          <CSelect {...defaultOptions}>
            <option value="Garantia do vendedor">Garantia do vendedor</option>
            <option value="Garantia de fábrica">Garantia de fábrica</option>
          </CSelect>
        </InputContainer>
      );

    case "listing_type_id":
      return (
        <InputContainer>
          <CSelect {...defaultOptions}>
            <option value="gold_pro">Premium</option>
            <option value="gold_special">Clássico</option>
          </CSelect>
        </InputContainer>
      );

    case "price":
      return (
        <InputContainer undo={false}>
          <NumberFormat
            onValueChange={({ floatValue }) => setfloatValue(floatValue)}
            renderText={value => <div>{value}</div>}
            name={name || `${label}-input`}
            id={id || `${label}-input`}
            placeholder="Digite apenas numeros"
            value={currentFloatValue}
            thousandSeparator="."
            decimalSeparator=","
            customInput={CInput}
            displayType="input"
            fixedDecimalScale
            decimalScale={2}
            prefix="R$"
            ref={ref}
          />
        </InputContainer>
      );

    case "shipping":
      return (
        <InputContainer>
          <CSelect {...defaultOptions}>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </CSelect>
        </InputContainer>
      );

    default:
      return (
        <InputContainer>
          <CInput {...defaultOptions} />
        </InputContainer>
      );
  }
}

DynamicInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  columns: PropTypes.object,
  icon: PropTypes.string,
};

export default DynamicInput;
