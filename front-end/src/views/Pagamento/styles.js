import styled from "styled-components";

export const ContainerPayment = styled.div`
  h2 {
    color: rgb(32, 168, 216);
  }
  .choose-button {
    button {
      width: 150px;
    }
  }

  .box-payment {
    margin-bottom: 2.5em;
    justify-content: center;
    > div {
      background-color: #ffffff;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 20px;
      max-width: 800px;
    }
  }
`;
