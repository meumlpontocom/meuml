import { CInput } from "@coreui/react";
import React, { useContext, useMemo } from "react";

export default function CustomInput({ context, options }) {
  const { updateFormData, formData = {} } = useContext(context);

  const inputValue = useMemo(() => {
    const { id } = options;
    if (Object.keys(formData).length) {
      return formData[id]?.id || formData[id];
    }
    return "";
  }, [formData, options]);

  return (
    <CInput
      {...options}
      value={inputValue}
      onChange={({ target: { id, value } }) =>
        updateFormData({ param: id, value })
      }
    />
  );
}
