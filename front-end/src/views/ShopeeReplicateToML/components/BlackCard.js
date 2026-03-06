import React                                          from "react";
import PropTypes                                      from "prop-types";
import { CCard, CCardBody, CCardFooter, CCardHeader } from "@coreui/react";

const BlackCard = ({ header, body, footer }) => {
  return (
    <CCard>
      <CCardHeader className="bg-gradient-secondary text-muted">
        {header}
      </CCardHeader>
      <CCardBody>
        {body}
      </CCardBody>
      {footer ? (
        <CCardFooter className="text-center">
          {footer}
        </CCardFooter>
      ) : <></>}
    </CCard>
  );
};

BlackCard.propTypes = {
  header: PropTypes.object,
  body: PropTypes.object,
  footer: PropTypes.object,
};

export default BlackCard;
