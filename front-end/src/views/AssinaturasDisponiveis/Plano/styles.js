import styled from "styled-components";

export const ContainerPlano = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
`;

export const TitlePlan = styled.div`
  width: 100%;
  span {
    color: #9a9a9a;
    font-weight: 300;
    font-size: 22px;
    line-height: 28px;
    text-transform: uppercase;
  }
  i {
    font-size: 20px;
    color: #9a9a9a;
  }
  .col {
    display: flex;
    align-items: center;
  }
`;

export const MainContainer = styled.main`
  width: 100%;
  display: flex;
  justify-content: center;
  .container {
    margin: initial;
  }
`;
