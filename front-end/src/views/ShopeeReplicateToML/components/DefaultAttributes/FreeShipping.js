import React, { useCallback, useContext } from "react";
import Container                          from "./Container";
import { CSelect }                        from "@coreui/react";
import shopeeReplicateToMLContext         from "../../shopeeReplicateToMLContext";

const FreeShipping = () => {
  const { form, setForm } = useContext(shopeeReplicateToMLContext);
  const handleChange = useCallback(
    ({ target: { id, value } }) => {
      setForm(c => ({
        ...c,
        basic: {
          ...c.basic,
          shipping: {
            ...c.basic.shipping,
            [id]: value === "true" ? true : false
          }
        },
      }));
    },
    [setForm],
  );
  return (
    <Container label="Frete Grátis" col={{ xs: 12, sm: 6 }}>
      <CSelect
        id="free_shipping"
        name="free-shipping"
        onChange={handleChange}
        value={form.basic.free_shipping}
      >
        <option value="">Selecione ...</option>
        <option value={true}>Sim</option>
        <option value={false}>Não</option>
      </CSelect>
    </Container>
  );
};

export default FreeShipping;
