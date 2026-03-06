import styled from "styled-components";

export const ContainerBoleto = styled.div`
  span {
    font-size: 20px;
    color: #9a9a9a;
    b {
      color: #4e4e4e;
      padding: 5px;
      border-radius: 5px;
    }
  }

  .price-total {
    text-align: end;
    span {
      font-size: 16px;
      color: #4e4e4e;
      b {
        font-size: 20px;
        background-color: transparent;
        color: #ad5d5d;
        padding: 5px;
        border-radius: 5px;
      }
    }
  }

  label {
    margin: 0;
  }
  .col {
    text-align: end;
    button {
      width: 100px;
    }
  }
`;
