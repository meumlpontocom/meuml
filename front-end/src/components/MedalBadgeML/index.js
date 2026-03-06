import React, { useEffect } from "react";
import styled from "styled-components";

const MedalBadgeStyles = styled.div`
  img,
  svg {
    vertical-align: baseline;
  }
`;

const MedalBadgeML = () => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://developers.mercadolibre.com.ar/api/badge/3892071146919087/MLB";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <MedalBadgeStyles>
      <div id="badge_meli_container"></div>
    </MedalBadgeStyles>
  );
};

export default MedalBadgeML;
