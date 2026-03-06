import React, { useCallback, useContext, useMemo } from "react";
import { v4 }                                      from "uuid";
import FormInput                                   from "./FormInput";
import { CRow, CCol }                              from "@coreui/react";
import shopeeReplicateToMLContext                  from "../../shopeeReplicateToMLContext";

const Form = () => {
  const {
    form,
    setForm,
    requiredAttributes,
  } = useContext(shopeeReplicateToMLContext);
  const handleInputChange = useCallback(({ target }) => {
    setForm(current => ({
      ...current,
      required: {
        ...current.required,
        [target.id]: target.value,
      },
    }));
  }, [setForm]);
  const attributes = useMemo(() => {
    return requiredAttributes.map((item) => {
      return { key: v4(), data: { ...item } };
    });
  }, [requiredAttributes]);
  return (
    <CRow className="d-flex align-items-center justify-content-center">
      <CCol xs={10}>
        <CRow>
          {attributes.map(({
              key,
              data: {
                id,
                name,
                tooltip,
                value_type,
                values,
              },
            }) => {
              return (
                <FormInput
                  key={key}
                  id={id}
                  name={name}
                  values={values}
                  tooltip={tooltip}
                  type={value_type}
                  value={form.required[id]}
                  onChange={handleInputChange}
                />
              );
            },
          )}
        </CRow>
      </CCol>
    </CRow>
  );
};

export default Form;
