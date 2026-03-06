import styled from "styled-components";

const MarketPlaceStyles = styled.span`
  background-color: ${(props) =>
    props.children === "Mercado Livre" ? `#FFE500` : `#FF5200`};
  color: #000;
  padding: 5px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 1px 1px 0 rgb(60 75 100 / 14%),
    0 2px 1px -1px rgb(60 75 100 / 12%), 0 1px 3px 0 rgb(60 75 100 / 20%);
`;

export default MarketPlaceStyles;
