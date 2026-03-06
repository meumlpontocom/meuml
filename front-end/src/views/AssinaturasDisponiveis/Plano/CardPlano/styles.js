import { Container } from "reactstrap";
import styled from "styled-components";

export const BoxCard = styled(Container)`
  max-width: 300px;
  border: solid 1px #d7d5d5;
  .body-card {
    height: 270px;
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
    div {
      padding: 5px;
      border-bottom: solid 1px #d7d5d5;
    }
  }

  .row {
    button {
      padding: 3px 15px 0;
      text-align: center;
      font-size: 12px;
      line-height: 34px;
      min-width: 120px;
      font-weight: 300;
    }
    .btn-secondary {
      background: #dedede;
      border-color: #cecdcd;
      color: #858585;
      font-weight: bold;
    }

    .btn-primary {
      color: #ffffff;
      background: #b25252;
      border-color: #8c3434;
      font-weight: bold;
    }

    background: #fff;
    &:last-child {
      border-bottom: transparent;
    }
    h3 {
      font-size: 14px;
      color: #4e4e4e;
      font-weight: 700;
      margin: 0;
    }
    p {
      font-size: 13px;
      color: #4e4e4e;
      margin: 0;
    }
  }
  .header-card {
    background: #898a8a85;
    padding: 10px 0;

    div {
      display: flex;
      justify-content: center;
      .price-footer {
        background: transparent;
      }
      h2 {
        font-size: 28px;
        font-weight: bold;
        line-height: 36px;
        color: #4e4e4e;
        text-transform: uppercase;
        margin: 0;
      }
      p {
        font-size: 14px;
        color: #4e4e4e;
        b {
          font-size: 18px;
          font-weight: 400;
          color: #ad5d5d;
          font-weight: bold;
        }
      }
      small {
        color: #4e4e4e;
      }

      .border-left {
        border-left: 1px solid #9a9a9a;
      }
    }
    .align-right {
      justify-content: flex-end;
    }
  }
`;
