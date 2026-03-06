import React     from "react";
import Td        from "./Td";
import PropTypes from "prop-types";

const ChartTableBody = ({ data, objectConverter }) => {
  return (
    <tbody>
      <tr>
        {objectConverter(data).map(row => {
          const { id, values } = data[row];
          return (
            <Td id={id} key={id}>
              {values.map((value, index) => (
                <Td id={value.id} key={value.id}>
                  <span style={{ fontWeight: 200 }}>{value.name}{(index + 1) < values.length ? ", " : ""}</span>
                </Td>
              ))}
            </Td>
          );
        })}
      </tr>
    </tbody>
  );
};

ChartTableBody.propTypes = {
  data: PropTypes.object.isRequired,
  objectConverter: PropTypes.func.isRequired,
};

export default ChartTableBody;
