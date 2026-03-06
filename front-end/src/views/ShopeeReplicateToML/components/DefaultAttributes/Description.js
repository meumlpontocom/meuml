import React, { useContext }      from "react";
import Container                  from "./Container";
import { CTextarea }              from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const Description = ({ handleFormChange }) => {
  const { form } = useContext(shopeeReplicateToMLContext);
  return (
    <Container col={{ xs: 12, className: "mb-3" }} label="Descrição">
      <CTextarea
        id="description"
        name="description"
        rows="10"
        cols="50"
        value={form.basic["description"]}
        onChange={handleFormChange}
        placeholder="Descreva o seu produto"
      />
    </Container>
  );
};

export default Description;
