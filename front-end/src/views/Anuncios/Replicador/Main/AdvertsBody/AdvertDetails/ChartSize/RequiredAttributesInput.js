import { FaCaretRight } from "react-icons/fa";
import { Input, InputGroup } from "reactstrap";
import PropTypes from "prop-types";
import InputGroupPrepend from "src/views/Anuncios/CatalogCharts/atoms/InputGroupPrepend";
import { CTooltip } from "@coreui/react";

const RequiredAttributesInput = ({ id, name, values, handleInputChange }) => {
  return (
    <>
      <CTooltip content={values[0].name}>
        <InputGroup className="mb-2">
          <InputGroupPrepend>{name}</InputGroupPrepend>
          <Input
            prepend={<FaCaretRight />}
            type="text"
            id={id}
            onChange={handleInputChange}
            list={`${id}-list`}
            placeholder={values?.length ? `${values[0].name}` : ""}
            disabled
          />
          <datalist id={`${id}-list`}>
            {values?.length &&
              values.map(({ id, name }) => (
                <option id={id} name={name} value={name} key={id}>
                  {name}
                </option>
              ))}
          </datalist>
        </InputGroup>
      </CTooltip>
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
