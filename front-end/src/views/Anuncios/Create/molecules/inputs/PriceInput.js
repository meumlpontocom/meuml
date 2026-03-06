import React, { useContext, useMemo } from "react";
import { CCardBody } from "@coreui/react";
import { FaDollarSign } from "react-icons/fa";
import { Card, CardHeader, Input } from "src/views/Anuncios/Create/atoms";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const PriceInput = () => {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const shouldRenderComponent = useMemo(() => !!form.condition, [form.condition]);

  function handlePriceValueChange({ target: { id, value } }) {
    setFormData({ id, value });
  }

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="advert-price-card">
      <CardHeader
        title="Preço"
        subtitle={
          <span>
            Informe o preço de{" "}
            <span className="text-info">
              <strong>{form.title?.toUpperCase()}</strong>
            </span>
          </span>
        }
      />
      <CCardBody>
        <Input
          prepend={<FaDollarSign />}
          id="price"
          name="advert-price-input"
          onChange={handlePriceValueChange}
          value={form.price}
        />
      </CCardBody>
    </Card>
  );
};

export default PriceInput;
