import React, { useContext }    from "react";
import Td                       from "./Td";
import { FaTimesCircle }        from "react-icons/fa";
import { toast }                from "react-toastify";
import { catalogChartsContext } from "../catalogChartsContext";

const ChartTableCustomRows = () => {
  const { customRows, setNewChartRows } = useContext(catalogChartsContext);

  function handleClick(params) {
    setNewChartRows(customRows.filter(({ id }) => id !== params.id));
    toast("Linha removida.", { type: toast.TYPE.INFO });
  }

  return customRows.map(({ id, attributes }) => (
    <tr key={id}>
      <Td id="select-row">
        <FaTimesCircle className="pointer" onClick={() => handleClick({ id })} />
      </Td>
      {attributes.map(({ id, name, values }) => {
        return (
          <Td id={id} name={name} key={id}>
            {values.map((value, index) => (
              <span key={value.id} style={{ fontWeight: 200 }}>
                {value.name}
                {index + 1 < values.length ? ", " : ""}
              </span>
            ))}
          </Td>
        );
      })}
    </tr>
  ));
};

export default ChartTableCustomRows;
