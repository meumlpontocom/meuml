import styled from "styled-components";
import { Modal } from "reactstrap";

export const ModalContainer = styled(Modal)`
  .row {
    justify-content: center;
    align-content: center;

    p {
      color: #f86c6b;
      text-align: center;
    }
    .col-10 {
      text-align: center;
      a {
        color: #4dbd74;
        font-weight: bold;
        text-align: center;
        text-decoration: underline;
      }
    }
  }
`;
