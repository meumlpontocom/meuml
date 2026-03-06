import React, { useContext } from "react";
import PropTypes from "prop-types";
import { CLabel } from "@coreui/react";
import Input from "./Input";
import { FaCaretRight } from "react-icons/fa";
import { catalogChartsContext } from "../catalogChartsContext";

const RequiredAttributesInput = ({ id, name, values, handleInputChange }) => {
  const { isLoadingCatalogCharts } = useContext(catalogChartsContext);
  return (
    <>
      <CLabel htmlFor={id}>{name}</CLabel>
      <Input
        prepend={<FaCaretRight />}
        disabled={isLoadingCatalogCharts}
        type="text"
        id={id}
        onChange={handleInputChange}
        list={`${id}-list`}
        placeholder={values?.length ? `Ex.: ${values[0].name}` : ""}
      />
      <datalist id={`${id}-list`}>
        {values?.length && values.map(({ id, name }) => (
          <option id={id} name={name} value={name} key={id}>
            {name}
          </option>
        ))}
      </datalist>
    </>
  );
};

RequiredAttributesInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  values: PropTypes.array.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default RequiredAttributesInput;
