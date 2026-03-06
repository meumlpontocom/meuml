import React, { useContext } from "react";
import { CCol } from "@coreui/react";
import { FaTags } from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const DisplayCondition = () => {
  const { form } = useContext(createMlAdvertContext);
  return (
    <CCol xs="12" sm="6" md="4">
      <h5>
        <strong>
          <FaTags className="mr-2 text-primary" />
          Condição:&nbsp;
        </strong>
        {form.condition === "new" ? "Novo" : "Usado"}
      </h5>
    </CCol>
  );
};

export default DisplayCondition;
