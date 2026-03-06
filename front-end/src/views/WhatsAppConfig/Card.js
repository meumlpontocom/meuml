import React                                   from "react";
import PropTypes                               from "prop-types";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";

Card.propTypes = {
  headerTitle: PropTypes.string,
  children: PropTypes.element,
};

function Card(props) {
  return (
    <CCol lg="12" xl="6">
      <CCard>
        <CCardHeader className="bg-gradient-dark text-white">
          <h5 className="mb-0">{props.headerTitle}</h5>
        </CCardHeader>
        <CCardBody>
          {props.children}
        </CCardBody>
      </CCard>
    </CCol>
  );
}

export default Card;
