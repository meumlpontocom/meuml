import styled from "styled-components";

export const Container = styled.div`
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 30px;
  .row {
    margin-left: 0;
  }
  .accounts {
    align-items: center;
    flex-direction: column;
    > p {
      color: #0080ff;
      font-weight: 700;
      font-size: 1.1rem;
      margin: 0;
    }
    > div {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      > p {
        color: #5c6873;
        margin: 0;
        margin-right: 8px;
      }
    }
  }
  .header-title {
    color: #5c6873;
    font-weight: 700;
    font-size: 1.2rem;
  }

  @media screen and (max-width: 600px) {
    .button-painel {
      .row {
        justify-content: center !important;
        > :nth-child(1) {
          margin-bottom: 10px;
        }
      }
    }
    .input-group {
      .input-group-append {
        display: none;
      }
    }
  }
`;
