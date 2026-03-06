import React, { useContext }               from "react";
import { Custom3DSwitch, SwitchContainer } from ".";
import { createMlAdvertContext }           from "../createMlAdvertContext";

const ClassicPublishingSwitch = () => {
  const { catalogOptions, form, toggleCreateClassicAdvert } = useContext(createMlAdvertContext);
  return catalogOptions.length ? (
    <SwitchContainer xs="12" className="mt-4">
      <Custom3DSwitch
        label="Publicar na lista geral"
        checked={form.createClassicAdvert}
        id="classicPublishingSwitch"
        name="classic-publishing-switch"
        onClick={toggleCreateClassicAdvert}
      />
    </SwitchContainer>
  ) : <></>;
};

export default ClassicPublishingSwitch;
