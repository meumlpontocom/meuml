import React, { useContext }               from "react";
import { CCol, CCard, CCardBody, CSelect } from "@coreui/react";
import { createMlAdvertContext }           from "../createMlAdvertContext";
import { FaTags }                          from "react-icons/fa";

const SelectVariation = () => {
  const { form, setSelectedVariationId } = useContext(createMlAdvertContext);
  const handleChange = (value) => {
    setSelectedVariationId(value);
  };

  return form.variations.length ? (
    <CCol xs="12" style={{ padding: "0px 0px 20px 0px" }}>
      <CCard className="border-primary">
        <CCardBody>
          <h3 className="mb-2"><FaTags className="mr-2 text-primary"/>Variação</h3>
          <CSelect
            onChange={(event) => handleChange(event.target.value)}
            defaultValue="default"
          >
            <option value="default">Principal</option>
            {form.variations.map((variation) => (
              <option
                id={variation._id}
                value={variation._id}
                key={variation._id}
              >
                {Object.values(variation.attributes)[0].value_name}
              </option>
            ))}
          </CSelect>
        </CCardBody>
      </CCard>
    </CCol>
  ) : (
    <></>
  );
};

export default SelectVariation;
