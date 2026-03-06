import React, { useContext }      from "react";
import Container                  from "./Container";
import { CInput }                 from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const Price = ({ handleFormChange }) => {
  const { form } = useContext(shopeeReplicateToMLContext);
  return (
    <Container col={{ xs: 12, md: 6, className: "mb-3" }} label="Preço">
      <CInput
        id="price"
        name="price"
        type="text"
        value={form.basic["price"]}
        onChange={handleFormChange}
      />
    </Container>
  );
};

export default Price;
