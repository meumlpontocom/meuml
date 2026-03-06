import { Col, Container, Row } from "reactstrap";
import styled, { css } from "styled-components";

export const BoxPersonal = styled(Container)`
  max-width: 1200px;
  .header-person {
    border-bottom: 1px solid #ccc;
  }
`;

export const HeaderCustom = styled(Col)`
  background: #d1d3d7;
  color: #5a5a5a;
  line-height: 40px;
  text-align: center;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: #fff;
  }
  ${({ active }) =>
    active &&
    css`
      text-decoration: underline;
      background: #59606d;
      color: #fff;
    `}
`;

export const OptionsPersonal = styled(Row)`
  border: 1px solid #ccc;
  padding: 0 8px;

  background: #fff;
  .header-option {
    padding: 12px 15px;
  }

  div {
    display: flex;
    align-items: center;
    label,
    p {
      margin: 0;
    }
  }
  .select-field {
    padding: 5px 15px;
    margin-bottom: 5px;
    .row {
      width: 100%;
      .col-4 {
        padding: 0;
        justify-content: flex-end;
      }
      .price-red {
        color: #ad5d5d;
        margin-left: 3px;
      }
    }
  }
`;

export const ColSelect = styled(Col)`
  background: ${({ checked }) => (checked ? "#edecec" : "#f8f8f8")};
`;
