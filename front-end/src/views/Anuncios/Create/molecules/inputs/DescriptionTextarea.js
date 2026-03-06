import React, { useContext } from "react";
import { CCardBody, CTextarea } from "@coreui/react";
import { Card, CardHeader } from "src/views/Anuncios/Create/atoms";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const DescriptionTextarea = () => {
  const createAdvertContext = useContext(createMlAdvertContext);
  const setFormData = createAdvertContext.setFormData;
  return (
    <Card
      isVisible={createAdvertContext.form.availableQuantity}
      className="border-primary"
      id="advert-description-card"
    >
      <CardHeader title="Descrição" subtitle="Cole ou digite a descrição do seu anúncio" />
      <CCardBody>
        <CTextarea
          rows="4"
          cols="50"
          id="description"
          name="advert-description-input"
          size="lg"
          placeholder="Digite aqui..."
          value={createAdvertContext.form.description}
          onChange={({ target: { id, value } }) => setFormData({ id, value })}
        />
      </CCardBody>
    </Card>
  );
};

export default DescriptionTextarea;
