import React, { useContext }      from "react";
import Container                  from "./Container";
import { CInput }                 from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const AvailableQuantity = ({ handleFormChange }) => {
  const id       = "available_quantity";
  const { form } = useContext(shopeeReplicateToMLContext);
  return (
    <Container col={{ xs: 12, md: 6, className: "mb-3" }} label="Quantitdade">
      <CInput
        id={id}
        name={id}
        type="number"
        value={form.basic[id]}
        onChange={handleFormChange}
      />
    </Container>
  );
};

export default AvailableQuantity;
