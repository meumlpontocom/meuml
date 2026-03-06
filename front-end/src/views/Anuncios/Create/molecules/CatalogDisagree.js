import React, { useContext }               from "react";
import { Custom3DSwitch, SwitchContainer } from "../atoms";
import { createMlAdvertContext }           from "../createMlAdvertContext";

const CatalogDisagree = () => {
  const { userTaggedOptionsAsInvalid, setDisableCatalogPublishing } = useContext(createMlAdvertContext);
  function handleSwitchChange({ target: { checked } }) {
    setDisableCatalogPublishing(checked);
  }
  return (
    <SwitchContainer className="mt-2">
      <Custom3DSwitch
        color="danger"
        label="Nenhuma opção de catálogo corresponde à minha publicação OU não desejo publicar no catálogo
        imediatamente."
        name="catalogDisagreeInput"
        id="catalogDisagreeInput"
        onChange={handleSwitchChange}
        checked={userTaggedOptionsAsInvalid}
      />
    </SwitchContainer>
  );
};

export default CatalogDisagree;
