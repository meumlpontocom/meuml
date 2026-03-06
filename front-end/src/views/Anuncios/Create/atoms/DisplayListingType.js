import React, { useContext } from "react";
import { CCol } from "@coreui/react";
import { FaSearch } from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const DisplayListingType = () => {
  const { form } = useContext(createMlAdvertContext);
  return (
    <CCol xs="12" sm="6" md="4">
      <h5>
        <strong>
          <FaSearch className="mr-2 text-primary" />
          Listagem:&nbsp;
        </strong>
        {form.listingType === "gold_pro" ? "Premium" : "Clássica"}
      </h5>
    </CCol>
  );
};

export default DisplayListingType;
