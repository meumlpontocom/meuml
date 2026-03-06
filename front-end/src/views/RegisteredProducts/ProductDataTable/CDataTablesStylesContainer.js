import styled from "styled-components";

const CDataTableStylesContainer = styled.div`
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
  .table-header {
    display: flex;
    gap: 15px;
    .table-filters {
      flex-grow: 1;
    }
  }
  .form-control {
    width: 80%;
    margin: 20px 0 25px 0;
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
  .variation-button {
    min-width: 140px;
  }
  .spinner-border {
    width: 0.75rem;
    height: 0.75rem;
    margin-left: 5px;
  }
`;

export default CDataTableStylesContainer;
