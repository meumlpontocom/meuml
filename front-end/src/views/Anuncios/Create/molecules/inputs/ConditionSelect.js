import React, { useContext, useMemo } from "react";
import { CCardBody, CSelect } from "@coreui/react";
import { Card, CardHeader } from "src/views/Anuncios/Create/atoms";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const ConditionSelect = () => {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const shouldRenderComponent = useMemo(
    () => !!form.selectedCategory.category_id,
    [form.selectedCategory.category_id],
  );

  function handleSelectValueChange({ target: { id, value } }) {
    setFormData({ id, value });
  }

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="advert-condition-card">
      <CardHeader title="Condição" subtitle="Seleione entre NOVO e USADO" />
      <CCardBody>
        <CSelect
          size="lg"
          id="condition"
          name="advert-condition-select"
          onChange={handleSelectValueChange}
          value={form.condition}
        >
          <option value="">selecione ...</option>
          <option value="new">novo</option>
          <option value="used">usado</option>
          <option value="not_specified">não especificado</option>
        </CSelect>
      </CCardBody>
    </Card>
  );
};

export default ConditionSelect;
