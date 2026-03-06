import styled   from "styled-components";

const MainHeadingStyles = styled.div`
  margin: 0 auto;
  text-align: center;
  font-size: 21px;

  .imageBadge {
    margin-left: 10px;
    margin-bottom: 0;
  }

  @media (max-width: 1600px) {
    font-size: 18px;
  }
  @media (max-width: 1400px) {
    font-size: 16px;
  }
  @media (max-width: 1199px) {
    font-size: 21px;
  }
  @media (max-width: 550px) {
    font-size: 14px;

    .card-body {
      flex-direction: column;
    }

    .imageBadge {
      margin: 10px;
      justify-content: center;
      align-items: center;
    }
  }
`;

export default MainHeadingStyles;
