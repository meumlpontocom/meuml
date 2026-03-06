import styled from "styled-components";

export const BoxPrice = styled.div`
  form {
    width: 100%;
    height: 100%;
  }
  .title-discount {
    color: #545454;
    font-weight: bolder;
    font-size: 1.125em;
  }
  .error {
    color: #ff0000;
    font-weight: bold;
    font-family: Roboto;
    &::after {
      content: "*";
    }
  }
  .input-group {
    .input-group-text {
      min-width: 164px;
    }
    p {
      margin: initial;
    }
  }

  @media screen and (max-width: 400px) {
    .input-group-prepend {
      display: none;
    }
  }
`;
