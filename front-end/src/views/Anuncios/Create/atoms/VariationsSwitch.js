import React          from "react";
import PropTypes      from "prop-types";
import Custom3DSwitch from "./Custom3DSwitch";

const VariationsSwitch = ({ collapseVariations, setCollapseVariations }) => {
  function toggleCollapseVariations() {
    setCollapseVariations(current => !current);
  }

  return (
    <Custom3DSwitch
      label={(collapseVariations ? "Desativar" : "Ativar") + " variações"}
      checked={collapseVariations}
      id="collapseVariationsSwitch"
      name="collapse-variations-switch"
      onClick={toggleCollapseVariations}
    />
  );
};

VariationsSwitch.propTypes = {
  collapseVariations: PropTypes.bool.isRequired,
  setCollapseVariations: PropTypes.func.isRequired,
};

export default VariationsSwitch;
