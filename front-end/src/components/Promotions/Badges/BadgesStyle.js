import dictionary from "./dictionary";
import styled     from "styled-components";

const BadgesStyles = styled.button`
  box-shadow: 0 1px 1px 0 rgb(60 75 100 / 14%),
    0 2px 1px -1px rgb(60 75 100 / 12%), 0 1px 3px 0 rgb(60 75 100 / 20%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: fit-content;
  max-width: fit-content;
  font-size: 12px;
  line-height: 1;
  padding: 3px 6px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);

  .eligible-text {
    font-weight: 700;
  }

  .active {
    font-weight: 700;
    display: flex;
    align-items: center;
  }

  .badge-name {
    white-space: nowrap;
    margin: 0 0.5rem;
    text-transform: uppercase;
    font-weight: 500;
  }
`;

const StylesContainer = styled(BadgesStyles)`
  background-color: ${({ active, promotionsType }) =>
    active
      ? dictionary[promotionsType].foreground
      : dictionary[promotionsType].background
  };
  color: ${({ active, promotionsType }) =>
    active
      ? dictionary[promotionsType].background
      : dictionary[promotionsType].foreground
  };
`;

export default StylesContainer;
