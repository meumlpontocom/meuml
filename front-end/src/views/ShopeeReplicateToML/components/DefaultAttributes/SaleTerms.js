import React, { useCallback, useContext } from "react";
import Container                          from "./Container";
import { CInput }                         from "@coreui/react";
import shopeeReplicateToMLContext         from "../../shopeeReplicateToMLContext";

const SaleTerms = () => {
  const {
    form: {
      basic: { sale_terms },
    },
    setForm,
  } = useContext(shopeeReplicateToMLContext);
  const handleChange = useCallback(
    ({ target: { value } }) => {
      setForm(state => ({
        ...state,
        basic: {
          ...state.basic,
          sale_terms: [{ ...state.basic.sale_terms[0], value }],
        },
      }));
    },
    [setForm],
  );
  return (
    <Container label="Prazo de envio" col={{ xs: 12, sm: 6 }}>
      <CInput type="number" step="1" min="1" value={sale_terms[0].value} onChange={handleChange} />
    </Container>
  );
};

export default SaleTerms;
