import React, { useContext }      from "react";
import Container                  from "./Container";
import { CSelect }                from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const ListingType = ({ handleFormChange }) => {
  const id = "listing_type_id";
  const { form } = useContext(shopeeReplicateToMLContext);
  return (
    <Container
      col={{ xs: 12, md: 6, className: "mb-3" }}
      label="Tipo da publicação"
    >
      <CSelect
        id={id}
        name={id}
        value={form.basic[id]}
        onChange={handleFormChange}
      >
        <option value="">Selecione ...</option>
        <option value="gold_pro">Premium</option>
        <option value="gold_special">Clássico</option>
      </CSelect>
    </Container>
  );
};

export default ListingType;
