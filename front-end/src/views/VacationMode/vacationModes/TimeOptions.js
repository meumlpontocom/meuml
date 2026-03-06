import React from "react";

const TimeOptions = () => {
  return [...Array(24)]
    .map(() => Math.floor(Math.random() * 7))
    .map((x, idx) =>
      idx % 2 === 1 ? (
        <option id={`time-option-${idx}`} value={`${idx < 10 ? "0" : ""}${idx}:00`}>
          {idx < 10 && "0"}
          {idx}:00
        </option>
      ) : (
        <></>
      ),
    );
};

export default TimeOptions;
