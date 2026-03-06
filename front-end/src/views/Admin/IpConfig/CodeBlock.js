import React  from "react";
import styled from "styled-components";

export const Line = ({ name, isObject = false, children, tabs }) =>
  isObject ? (
    <>
      <LineStyle>
        "{name}": {"{"}
      </LineStyle>
      {children}
      <LineStyle>{"},"}</LineStyle>
    </>
  ) : (
    <LineStyle>
      {tabs ? <span>&nbsp;&nbsp;&nbsp;&nbsp;</span> : <></>}"{name}": "{children}",
    </LineStyle>
  );

const LineStyle = styled.p`
  margin: 0 10px;
  padding: 0;
`;

export const Json = styled.div`
  color: #ff0102;
  border: solid black 1px;
  background-color: #01010115;
`;