import styled from "styled-components";

const CDataTableStyles = styled.div`
  label {
    font-size: 1.25rem;
    margin: 20px 0 25px 0;
  }
  a {
    text-decoration: none;
  }
  svg {
    right: inherit;
    margin-left: 20px;
  }
  .table-sku {
    min-width: 80px;
    word-wrap: break-word;
    word-break: break-all;
  }
  .table-buttons {
    border-top: 0;
    display: flex;
    gap: 10px;
    @media (max-width: 1024px) {
      flex-direction: column;
    }
  }
  .form-control {
    width: 80%;
    margin: 20px 0 25px 0;
  }
`;

export default CDataTableStyles;
