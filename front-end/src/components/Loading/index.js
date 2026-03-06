import React        from "react";
import PropTypes    from "prop-types";
import Loading      from "react-loading";
import {CCol, CRow} from "@coreui/react";

LoadPageHandler.propTypes = {
  isLoading: PropTypes.bool,
  render: PropTypes.any,
  marginTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

LoadPageHandler.defaultProps = {
  marginTop: "200px"
};

export default function LoadPageHandler({marginTop, isLoading, render}) {
  switch (isLoading) {
    case false:
      return render;
    default:
      return (
        <CRow style={{justifyContent: "center", marginTop: marginTop}}>
          <CCol
            sm={{size: "auto"}}
            md={{size: "auto"}}
            lg={{size: "auto"}}
            xs={{size: "auto"}}
          >
            <Loading
              type="spinningBubbles"
              color="#054785"
              height={150}
              width={100}
            />
          </CCol>
        </CRow>
      );
  }
}
