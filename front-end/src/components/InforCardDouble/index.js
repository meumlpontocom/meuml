import React from "react";

//CoreUI
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CWidgetSimple,
} from "@coreui/react";

const InfoCardDouble = ({
  topLeftVariation,
  leftBoardData,
  leftBoardTitle,
  topRightVariation,
  rightBoardData,
  rightBoardTitle,
  leftBoardIcon,
  rightBoardIcon,
}) => {
  return (
    <CCol xs="12" sm="12" md="6" lg="6" className="infocard-double-width">
      <CCard className="brand-card card-height">
        <CCardHeader
          style={{ height: "46px" }}
          className="card-header d-flex justify-content-between bg-light"
        >
          <div className="mr-auto ml-2">
            <p className="text-success mb-0">
              {topLeftVariation && (
                <>
                  <span>{topLeftVariation}</span>
                  <i className="cil-arrow-top ml-2 d-inline d-lg-none d-xl-inline" />
                </>
              )}
            </p>
          </div>
          <div className="ml-0 ml-sm-auto mr-0 mr-sm-2">
            <p className="text-danger mb-0">
              {topRightVariation && (
                <>
                  <i className="cil-arrow-bottom mr-0 mr-sm-2 d-inline d-lg-none d-xl-inline" />{" "}
                  <span>{topRightVariation}</span>
                </>
              )}
            </p>
          </div>
        </CCardHeader>
        <CCardBody className="d-flex flex-wrap justify-content-around ">
          <div className="d-flex justify-content-center">
            <div className="h1 mr-2">
              <i className={leftBoardIcon} />
            </div>
            <div>
              <p className="h4 mb-1 text-left">{leftBoardData}</p>
              <p className="text-muted text-left font-weight-bold mb-0 mr-2">
                {leftBoardTitle}
              </p>
            </div>
          </div>
          <div className="c-vr mx-2" />
          <div className="d-flex justify-content-center">
            <div className="h1 mx-3">
              <i className={rightBoardIcon} />
            </div>
            <div>
              <p className="h4 text-left mb-1">{rightBoardData}</p>
              <p className="text-muted text-left font-weight-bold mb-0 infocard-double-title">
                {rightBoardTitle}
              </p>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default InfoCardDouble;
