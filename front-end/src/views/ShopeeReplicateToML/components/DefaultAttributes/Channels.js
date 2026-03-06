import React, { useContext }           from "react";
import { CRow, CCol, CLabel, CSwitch } from "@coreui/react";
import ShopeeReplicateToMLContext      from "../../shopeeReplicateToMLContext";

const Channels = ({ handleFormChange }) => {
  const { form }          = useContext(ShopeeReplicateToMLContext);
  const handleInputChange = ({ target: { id }, }) =>
    handleFormChange({
      target: { id, value: !form.basic[id] }
    });
  const Label = ({ id, label, children }) => (
    <CCol xs={12} className="d-flex align-items-center mb-3">
      {children}&nbsp;
      <CLabel htmlFor={id} id={`${id}-label`}>
        {label}
      </CLabel>
    </CCol>
  );
  return (
    <CCol xs={12} md={6}>
      <CRow>
        <p className="text-info ml-3">Canais da publicação</p>
        <Label
          label="Publicar no marketplace"
          id="marketplace-publishing"
          name="create_classic_advertising"
        >
          <CSwitch
            onChange={handleInputChange}
            checked={form.basic["create_classic_advertising"]}
            color="info"
            id="create_classic_advertising"
            name="create_classic_advertising"
          />
        </Label>
        <Label
          label="Publicar no catálogo"
          id="create_classic_advertising"
          name="create_catalog_advertising"
        >
          <CSwitch
            onChange={handleInputChange}
            checked={form.basic["create_catalog_advertising"]}
            color="info"
            id="create_catalog_advertising"
            name="create_catalog_advertising"
          />
        </Label>
      </CRow>
    </CCol>
  );
};

export default Channels;
