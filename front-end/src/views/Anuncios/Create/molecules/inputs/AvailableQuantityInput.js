import React, { useContext, useMemo } from "react";
import { CCardBody } from "@coreui/react";
import { FaBoxes } from "react-icons/fa";
import { Card, CardHeader, Input } from "src/views/Anuncios/Create/atoms";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const AvailableQuantityInput = () => {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const shouldRenderComponent = useMemo(() => !!form.price, [form.price]);

  function handleInputValueChange({ target: { id, value } }) {
    setFormData({ id, value });
  }

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="advert-availableQuantity-card">
      <CardHeader title="Quantidade" subtitle="Informe o número de itens disponíveis para venda" />
      <CCardBody>
        <Input
          type="number"
          prepend={<FaBoxes />}
          id="availableQuantity"
          name="advert-availableQuantity-input"
          value={form.availableQuantity}
          onChange={handleInputValueChange}
        />
      </CCardBody>
    </Card>
  );
};

export default AvailableQuantityInput;
