import { Row } from "reactstrap";
import styled from "styled-components";
import { BoxCard } from "../../CardPlano/styles";

export const NavContainer = styled(BoxCard)`
  max-width: initial;
  .header-card {
    div {
      h2 {
        position: relative;
        padding-top: 15px;
        &::before {
          position: absolute;
          top: 5px;
          left: 0px;
          content: "Versão";
          font-size: 10px;
          line-height: 1;
          font-weight: 300;
          color: rgb(255, 255, 255);
          text-transform: none;
        }
      }
      p {
        font-size: 20px;
      }
      .no-red {
        b {
          color: #4e4e4e;
          font-size: 26px;
        }
      }
    }
  }
  .footer-card {
    div {
      display: flex;
      justify-content: center;
      padding: 10px;
      button {
        padding: 10px;
        font-weight: 700;
        font-size: 20px;
      }
    }
  }
`;

export const BodyNav = styled(Row)`
  min-height: 400px;
  max-height: 400px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 8px;
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(0deg, #858585 0%, #d7d5d5 100%);
    &:hover {
      background: linear-gradient(0deg, #d7d5d5 0%, #858585 100%);
    }
    border: 1px solid transparent;
    border-radius: 9px;
    background-clip: content-box;
  }
  .row {
    border-bottom: 1px solid #ccc;
    padding: 5px 0;
  }
  border-bottom: 1px solid #ccc;
`;
