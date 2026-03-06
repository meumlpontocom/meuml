import React                               from "react";
import { FaCaretDown, FaCaretLeft }        from "react-icons/fa";
import { CBadge, CCardHeader, CCol, CRow } from "@coreui/react";

const CardHeader = ({ toggleCollapse, type, path, description, isCollapsed }) => {
  const badgeColor =
    type === "GET"
      ? "success"
      : type === "POST"
      ? "warning"
      : type === "DELETE"
      ? "danger"
      : type === "PUT"
      ? "info"
      : "secondary";
  return (
    <CCardHeader className="pointer" onClick={toggleCollapse}>
      <CRow>
        <CCol xs="10">
          <h5>
            <CBadge color={badgeColor}>{type}</CBadge>&nbsp;{path}
          </h5>
          <p className="text-muted">{description}</p>
        </CCol>
        <CCol xs="2" className="d-flex align-items-center justify-content-end">
          {isCollapsed ? (
            <h1>
              <FaCaretDown />
            </h1>
          ) : (
            <h1>
              <FaCaretLeft />
            </h1>
          )}
        </CCol>
      </CRow>
    </CCardHeader>
  );
};

export default CardHeader;
