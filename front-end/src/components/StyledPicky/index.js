import { Picky } from "react-picky";
import styled    from "styled-components";

export const StyledPicky = styled(Picky)`
  border-radius: 0.25rem;
  border: 1px solid rgb(216, 219, 224);
  font-size: 0.875rem;
  color: #4f5d73;

  input {
    outline: none;
    margin-bottom: 5px;
  }

  input:focus {
    border-color: #958bef;
    box-shadow: 0 0 0 0.2rem rgb(50 31 219 / 25%);
  }

  button {
    border-radius: 0.25rem;
    padding: 0.375rem 1.75rem 0.375rem 0.75rem;
  }

  button span {
    color: #4f5d73;
  }

  button:focus {
    border-color: #958bef;
    box-shadow: 0 0 0 0.2rem rgb(50 31 219 / 25%);
    outline: none;
  }

  div[role="option"] {
    margin: 0 auto;
    margin-bottom: 2px;
    border-radius: 0.25rem;
    border-bottom: none;
    display: flex;
    align-items: center;
  }

  .picky__dropdown .option input[type="checkbox"],
  .picky__dropdown .option input[type="radio"] {
    margin-right: 10px;
    margin-bottom: 0px;
    border-radius: 0.25rem;
  }

  .picky__filter__input {
    padding: 0.375rem 0.75rem;
  }

  .picky__dropdown {
    margin-top: 5px;
    padding: 8px 12px;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 21, 0.15);
  }

  .picky__dropdown .option:focus,
  .picky__dropdown li:focus {
    outline: #958bef auto 5px !important;
  }
`;
