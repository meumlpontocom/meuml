import React, { useContext } from "react";
import { FlexConfigContext } from "../../FlexConfigContext";

export default function LastUpdateDate() {
  const { currentFlexConfig } = useContext(FlexConfigContext);
  return (
    <small className="text-muted">
      Última atualização{" "}
      {new Date(currentFlexConfig.adoption?.last_update).toLocaleDateString(
        "pt-BR"
      )}
    </small>
  );
}
