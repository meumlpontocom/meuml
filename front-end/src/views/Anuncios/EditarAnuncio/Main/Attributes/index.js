import React, { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Col, Row, Input } from "reactstrap";
import { updateFormData } from "../../../../../redux/actions/_editAdvertActions";
import Label from "./Label";

function Attributes() {
  const dispatch = useDispatch();
  const {
    form,
    advertData: { editable_fields, attributes },
  } = useSelector(({ editAdvert }) => editAdvert);

  const attributeList = useMemo(() => {
    function getAttributesWithSelectableValues() {
      return attributes.filter(({ value_type }) => value_type === "list");
    }

    function getAttributesWithoutSelectableValues() {
      return attributes.filter(({ value_type }) => value_type === "string");
    }
    if (
      editable_fields.length &&
      editable_fields.find((field) => field === "attributes")
    ) {
      if (attributes) {
        return {
          selectInputs: getAttributesWithSelectableValues(),
          textInputs: getAttributesWithoutSelectableValues(),
        };
      }
    }
    return {
      selectInputs: [],
      textInputs: [],
    };
  }, [attributes, editable_fields]);

  const handleInputChange = ({ target: { id, name, value } }) => {
    dispatch(
      updateFormData("attributes", [
        ...form.attributes.filter((attribute) => attribute.id !== id),
        {
          id,
          name,
          value_name: value,
        },
      ])
    );
  };

  const getAttributeValue = useCallback(
    ({ id, value_id }) => {
      const attribute = form.attributes.find(
        (attribute) => attribute.id === id
      );

      if (attribute?.value_name !== null && attribute?.value_name !== null)
        return attribute?.value_name;
      else if (value_id) return value_id;
      else return "";
    },
    [form.attributes]
  );

  return (
    <>
      {attributeList.selectInputs.length ? (
        <Container>
          <Row>
            {attributeList.selectInputs.map(
              ({ id, name, values, value_id }, index) => {
                return (
                  <Col xs="12" sm="6" md="4" lg="3" xl="3" key={index}>
                    <Label id={id} name={name} />
                    <select
                      disabled={values?.length <= 1}
                      id={id}
                      name={name}
                      className="custom-select"
                      value={getAttributeValue({ id, value_id })}
                      onChange={handleInputChange}
                    >
                      {values.map(({ id, name }, index) => {
                        return (
                          <option key={index} id={id} name={name} value={id}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </Col>
                );
              }
            )}
          </Row>
        </Container>
      ) : (
        <></>
      )}
      {attributeList.textInputs.length ? (
        attributeList.textInputs.map(
          ({ id, name, value_id, value_max_length }, index) => {
            return (
              <Col xs="12" sm="6" md="4" lg="3" xl="3" key={index}>
                <Label id={`label-${id}`} name={`label-${name}`} />
                <Input
                  id={id}
                  name={name}
                  type="text"
                  placeholder={value_id}
                  value={getAttributeValue({ id, value_id })}
                  onChange={handleInputChange}
                  maxLength={value_max_length}
                />
              </Col>
            );
          }
        )
      ) : (
        <></>
      )}

      {!attributeList.selectInputs && !attributeList.textInputs ? (
        <h4 className="text-danger text-center">
          Este anúncio não possui atributos.
        </h4>
      ) : (
        <></>
      )}
    </>
  );
}

export default Attributes;
