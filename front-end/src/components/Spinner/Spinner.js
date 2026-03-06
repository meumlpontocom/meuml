import React     from "react";
import PropTypes from "prop-types";
import styled    from "styled-components";

const AnimationContainer = styled.svg`
  animation: rotate 2s linear infinite;
  margin: -25px 0 0 -25px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-top: ${(props) => props.top}px;

  & .path {
    stroke: ${(props) => props.color};
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`;

function Spinner({ color = "#5652bf", width = 50, height = 50, top = 0 }) {
  return (
    <AnimationContainer
      viewBox="0 0 50 50"
      width={width}
      height={height}
      color={color}
      top={top}
    >
      <circle
        className="path"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="4"
      />
    </AnimationContainer>
  );
}

Spinner.propTypes = {
  color: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  top: PropTypes.number,
};

export default Spinner;
