import React, { useContext, useMemo } from "react";
import { CCardBody, CSelect } from "@coreui/react";
import { Card, CardHeader } from "src/views/Anuncios/Create/atoms";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const ListingTypeSelect = () => {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const shouldRenderComponent = useMemo(() => !!form.description, [form.description]);

  function handleSelectValueChange({ target: { id, value } }) {
    setFormData({ id, value });
  }

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="advert-listingType-card">
      <CardHeader title="Tipo" subtitle="Selecione entre anúncio CLÁSSICO ou PREMIUM" />
      <CCardBody>
        <CSelect
          size="lg"
          id="listingType"
          name="advert-condition-select"
          onChange={handleSelectValueChange}
          value={form.listingType}
        >
          <option value="">selecione ...</option>
          <option value="gold_special">clássico</option>
          <option value="gold_pro">premium</option>
        </CSelect>
      </CCardBody>
    </Card>
  );
};

export default ListingTypeSelect;
