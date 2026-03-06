import React, { useCallback, useState }                         from "react";
import PropTypes                                                from "prop-types";
import CardHeader                                               from "./CardHeader";
import { CCard, CCardBody, CCardFooter, CCol, CCollapse, CRow } from "@coreui/react";

const Request = ({ children, type, path, description, sendBtn }) => {
  const [showCardContent, setShowCardContent] = useState(false);

  const onCardHeaderClick = useCallback(() => {
    setShowCardContent(current => !current);
  }, []);

  return (
    <CCard>
      <CardHeader
        toggleCollapse={onCardHeaderClick}
        type={type}
        path={path}
        description={description}
        isCollapsed={showCardContent}
      />
      <CCollapse show={showCardContent}>
        <CCardBody>{children}</CCardBody>
        <CCardFooter>
          <CRow>
            <CCol xs="12" className="text-right">
              {sendBtn}
            </CCol>
          </CRow>
        </CCardFooter>
      </CCollapse>
    </CCard>
  );
};

Request.propTypes = {
  children: PropTypes.any,
  type: PropTypes.oneOf(["GET", "POST", "PUT", "DELETE", "PATCH"]).isRequired,
  path: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  sendBtn: PropTypes.element.isRequired
}

export default Request;