import styled from "styled-components";

export const Container = styled.div`
  @media screen and (max-width: 450px) {
    .badge {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      .badge {
        margin-top: 10px;
      }
    }
  }
`;
