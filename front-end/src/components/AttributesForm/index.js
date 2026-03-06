import React, { useContext, useMemo, useState } from "react";
import CollapseCardWithSelect from "../CollapseCardWithSelect";
import "./index.css";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Nav,
  Label,
  NavItem,
} from "reactstrap";
import CustomInput from "./CustomInput";
import { CCard, CCardBody, CCardHeader, CCol, CRow } from "@coreui/react";

export default function AttributesForm({ context }) {
  const { visibleAttributeList } = useContext(context);

  const requiredAttributeList = useMemo(() => {
    return visibleAttributeList.filter(
      (attribute) =>
        attribute.tags["required"] || attribute.tags["catalog_required"]
    );
  }, [visibleAttributeList]);

  const optionalAttributeList = useMemo(() => {
    return visibleAttributeList.filter(
      (attribute) =>
        !attribute.tags["required"] && !attribute.tags["catalog_required"]
    );
  }, [visibleAttributeList]);

  const [render, setRender] = useState(false);
  const attributeListToRender = useMemo(() => {
    if (render) return [...optionalAttributeList];
    else return [...requiredAttributeList];
  }, [render, optionalAttributeList, requiredAttributeList]);

  return (
    <CCard>
      <CCardHeader>
        <Nav className="attributes-nav">
          <NavItem
            className={`attributes-nav-item ${
              !render ? "attributes-nav-item-active" : ""
            }`}
            active={!render}
            onClick={() => setRender(false)}
            id="required"
            name="required-attributes"
          >
            Obrigatórias
          </NavItem>
          <NavItem
            className={`attributes-nav-item ${
              render ? "attributes-nav-item-active" : ""
            }`}
            id="notRequired"
            name="not-required-attributes"
            active={render}
            onClick={() => setRender(true)}
          >
            Opcionais
          </NavItem>
        </Nav>
      </CCardHeader>
      <CCardBody>
        <CRow>
          {attributeListToRender.length ? (
            attributeListToRender.map((attribute, index) => {
              if (
                attribute.tags["required"] &&
                attribute.tags["allow_variations"]
              )
                return <></>;
              if (
                attribute.values &&
                attribute.values.length &&
                attribute.id !== "BRAND"
              ) {
                return (
                  <CollapseCardWithSelect
                    key={index}
                    attribute={attribute}
                    context={context}
                  />
                );
              }
              return (
                <CCol
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  className="mb-3"
                  key={attribute.id}
                >
                  <Label htmlFor={attribute.id}>{attribute.name}</Label>
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="cil-caret-right" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <CustomInput
                      context={context}
                      index={index}
                      options={{
                        id: attribute.id,
                        name: attribute.name,
                        className: "form-control",
                        description: attribute.hint,
                        title: attribute.hint,
                        type:
                          attribute.value_type === "string"
                            ? "text"
                            : attribute.value_type.split("_")[0],
                        placeholder: attribute.tags?.required
                          ? "Obrigatório para todas as modalidades de publicação!"
                          : attribute.tags?.catalog_required
                            ? "Obrigatório apenas para publicação em catalogo."
                            : "Opcional",
                      }}
                    />
                    {attribute.default_unit ? (
                      <InputGroupAddon addonType="append">
                        <InputGroupText>
                          {attribute.default_unit.toString()}
                        </InputGroupText>
                      </InputGroupAddon>
                    ) : (
                      <></>
                    )}
                  </InputGroup>
                </CCol>
              );
            })
          ) : (
            <React.Fragment key={Math.random()} />
          )}
        </CRow>
      </CCardBody>
    </CCard>
  );
}
