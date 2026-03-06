import React       from "react";
import ListInput   from "./ListInput";
import NumberInput from "./NumberInput";
import StringInput from "./StringInput";

const FormInput = ({ id, tooltip, name, value, values, type, onChange }) => {
  if (type === "number")
    return (
      <NumberInput
        id={id}
        name={name}
        tip={tooltip}
        value={value}
        onChange={onChange}
      />
    );
  else if (type === "boolean")
    return (
      <ListInput
        tip={tooltip}
        id={id}
        name={name}
        options={values}
        value={value}
        onChange={onChange}
      />
    );
  else
    return (
      <StringInput
        tip={tooltip}
        id={id}
        name={name}
        hints={values}
        value={value}
        onChange={onChange}
      />
    );
};
export default FormInput;
