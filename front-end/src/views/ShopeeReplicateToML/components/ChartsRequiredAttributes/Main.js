import React, { useCallback, useContext } from "react";
import BlackCard from "../BlackCard";
import CardHeader from "./CardHeader";
import { CCol, CRow } from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";
import FormInput from "../RequiredAttributesForm/FormInput";

const Main = ({ requiredAttributes }) => {
  const { form, setForm } = useContext(shopeeReplicateToMLContext);
  const handleInputChange = useCallback(
    ({ target }) => {
      setForm(current => ({
        ...current,
        charts: {
          ...current.charts,
          [target.id]: target.value,
        },
      }));
    },
    [setForm],
  );

  const gtinIsAllowed = (() => {
    const gtinBehavior = form.basic.gtin_behavior ?? "keep-original-gtin";

    if (gtinBehavior === "keep-original-gtin" || gtinBehavior === "no-gtin") return true;

    if (gtinBehavior === "overwrite-gtin" && !!form.basic.gtin) {
      return true;
    }

    return false;
  })();

  return !gtinIsAllowed ? (
    <></>
  ) : (
    <CCol xs={12}>
      <BlackCard
        header={<CardHeader />}
        body={
          <CRow className="d-flex align-items-center justify-content-center">
            <CCol xs={10}>
              <CRow>
                {requiredAttributes.map(attribute => (
                  <FormInput
                    key={attribute.id}
                    id={attribute.id}
                    name={attribute.name}
                    value={form.charts[attribute.id]}
                    values={attribute.values}
                    type={attribute.value_type}
                    onChange={handleInputChange}
                  />
                ))}
              </CRow>
            </CCol>
          </CRow>
        }
      />
    </CCol>
  );
};

export default Main;
