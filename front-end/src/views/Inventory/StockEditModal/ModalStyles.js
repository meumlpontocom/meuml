import styled from "styled-components";

const ModalStyles = styled.div`
  .modal-dialog {
    max-width: 800px;
  }
  .modal-content {
    min-height: 435px;
  }
  .product-info {
    margin: 0 -15px 15px -15px;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;

    .product-name,
    .product-sku {
      display: inline-block;
      margin: 5px 0;
    }
  }
  .input-container {
    gap: 16px;
    display: flex;
    align-items: flex-start;
  }
  .input-container > * {
    width: 376px;
  }
  .input-group,
  .form-check {
    max-width: 376px;
    label {
      margin-bottom: 0;
    }
  }
  .input-group-prepend {
    margin-right: 0;
  }
  .input-group-text {
    min-width: 175px;
    justify-content: center;
  }
  .form-control {
    background-color: #fff;
    /* height: 100%; */
    height: 40px;
  }

  input[name="purchase-code"]:disabled,
  input[name="order-code"]:disabled {
    background-color: #d8dbe0;
    font-style: italic;
    border-color: inherit;
    text-align: center;
  }

  button:disabled {
    cursor: not-allowed;
  }

  .modal-footer {
    button {
      min-width: 100px;
    }
  }

  @media (max-width: 590px) {
    .product-info {
      flex-direction: column;
    }
    .input-container {
      flex-direction: column;
      align-items: center;
    }
    .input-container > * {
      width: 100%;
    }
    .input-group {
      max-width: 100%;
    }
    .form-check {
      align-self: flex-end;
    }
    .exp-date {
      order: 2;
    }
  }
`;

export default ModalStyles;
