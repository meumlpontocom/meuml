import { CRow } from "@coreui/react";
import styled   from "styled-components";

const RightSideCardsStyles = styled(CRow)`
  @media (max-width: 1300px) {
    .text-value-lg {
      font-size: 16px;
    }
  }

  @media (max-width: 550px) {
    flex-direction: column;
  }
`;

export default RightSideCardsStyles;
