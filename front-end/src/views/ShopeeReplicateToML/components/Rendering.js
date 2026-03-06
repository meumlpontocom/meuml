import React, { useContext }      from "react";
import PropTypes                  from "prop-types";
import { CCol, CRow }             from "@coreui/react";
import shopeeReplicateToMLContext from "../shopeeReplicateToMLContext";

const Rendering = ({ children }) => {
  const { showAdvertPreview, selectedAccounts } = useContext(shopeeReplicateToMLContext);
  if (showAdvertPreview)
    return children[0];
  if (selectedAccounts.length === 0)
    return children[1];
  return (
    <CCol>
      <CRow>
        {[...children].filter((x, y) => y !== 0)}
      </CRow>
    </CCol>
  );
};

Rendering.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Rendering;
