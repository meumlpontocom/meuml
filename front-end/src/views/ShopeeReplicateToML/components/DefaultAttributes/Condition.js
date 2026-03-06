import React, { useContext }      from "react";
import Container                  from "./Container";
import { CSelect }                from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const Condition = ({ handleFormChange }) => {
  const { form } = useContext(shopeeReplicateToMLContext);
  return (
    <Container col={{ xs: 12, md: 6, className: "mb-3" }} label="Condição">
      <CSelect
        id="condition"
        name="condition"
        value={form.basic["condition"]}
        onChange={handleFormChange}
      >
        <option value="">Selecione ...</option>
        <option value="new">Novo</option>
        <option value="used">Usado</option>
      </CSelect>
    </Container>
  );
};

export default Condition;
