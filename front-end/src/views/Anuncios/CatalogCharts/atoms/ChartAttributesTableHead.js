import React from "react";
import Th    from "./Th";

const ChartAttributesTableHead = ({ data, objectConverter }) => (
  <thead>
    <tr>
      {objectConverter(data).map(row => {
        const { id, name } = data[row];
        return (
          <Th id={id} key={id}>
            {name}
          </Th>
        );
      })}
    </tr>
  </thead>
);

export default ChartAttributesTableHead;
