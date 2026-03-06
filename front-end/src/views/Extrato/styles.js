import styled from "styled-components";

export const BoxHistory = styled.div`
  &.container {
    margin: 0;
  }
  .table-box {
    justify-content: center;

    .table-responsive {
      thead {
        text-transform: uppercase;
      }
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      text-align: center;
      background-color: #ffffff;
      max-width: 1000px;
      position: relative;
      padding: 20px 40px;
      padding-top: 70px;
      &::before {
        position: absolute;
        top: 40px;
        left: 40px;
        content: "MEUS PEDIDOS";
        font-size: 22px;
        line-height: 1;
        font-weight: bold;
        color: #20a8d8;
        text-transform: none;
      }
      ul {
        padding: 0;
        margin: 0;
        margin-top: 20px;
      }
    }
  }
  .my-plan {
    max-width: 180px;
    > div {
      background-color: #ffffff;
      border: 1px solid #c8ced3;
      border-radius: 4px;
      .row {
        justify-content: center;
        padding: 10px 0;

        .title-plan {
          font-weight: 700;
          color: #73818f;
        }
      }
    }
  }
`;

export const TypePlan = styled.div`
  color: #fff;
  background-color: ${({ typecolor }) =>
    typecolor.toLowerCase() === "gratuito" ? "#4dbd74" : "#b25252"};
  background-color: ${({ typecolor }) =>
    typecolor.toLowerCase() === "gratuito"
      ? "1px solid #4dbd74"
      : "1px solid #8c3434"};

  font-weight: bold;
  margin-left: 4px;
  padding: 0 5px;
`;

export const Td = styled.td`
  color: ${({ status }) => status};
  font-weight: bold;
  p {
    font-weight: initial;
    padding: 0;
    margin: 0;
  }
`;
