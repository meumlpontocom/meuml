import React       from "react";
import Input       from "./Input";
import PropTypes   from "prop-types";
import { CLabel }  from "@coreui/react";
import { FaBoxes } from "react-icons/fa";

const VariationAvailableQuantity = ({ variationForm, setVariationForm }) => {
  return (
    <>
      <CLabel htmlFor="availableQuantity">Quantidade</CLabel>
      <Input
        type="number"
        prepend={<FaBoxes />}
        id="availableQuantity"
        name="variation-amount-input"
        value={variationForm.availableQuantity}
        onChange={({ target: { id, value } }) => setVariationForm({ id, value })}
      />
    </>
  );
};

VariationAvailableQuantity.propTypes = {
  variationForm: PropTypes.object.isRequired,
  setVariationForm: PropTypes.func.isRequired,
};

export default VariationAvailableQuantity;
