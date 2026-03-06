import styled from "styled-components";
import { Row } from "reactstrap";

export const RowContainer = styled(Row)`
  display: flex;
  justify-content: center;

  @media screen and (max-width: 768px) {
    .box-toggle {
      .mr-5 {
        width: 100%;
        display: flex;
        margin: 0;
      }
    }
  }
`;
