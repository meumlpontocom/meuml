import React from "react";
import { FaHashtag } from "react-icons/fa";
import { HashInputSimpleContainer } from "./HashInputSimpleStyle";

const HashInputSimple = ({ hash, setHash }) => {
  return (
    <HashInputSimpleContainer>
      <input
        type="text"
        id="hash-input"
        name="hash-input"
        placeholder="Cole ou digite seu código"
        value={hash}
        onChange={({ target: { value } }) => setHash(value)}
      />
      <span>
        <FaHashtag />
      </span>
    </HashInputSimpleContainer>
  );
};

export default HashInputSimple;
