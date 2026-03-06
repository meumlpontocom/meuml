import React, { useContext } from "react";
import context from "../../context";

export default function ProfessionalAdvertText() {
  const { qualityDetails } = useContext(context);

  return (
    <>
      <p className="text-info">{qualityDetails?.level}</p>
      <p>
        Parabéns, não há ações de melhoria de qualidade sugeridas para este
        anúncio.
      </p>
    </>
  );
}
