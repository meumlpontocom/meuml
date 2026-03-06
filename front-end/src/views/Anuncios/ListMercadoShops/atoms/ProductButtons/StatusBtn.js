/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Loading from "react-loading";
import { CCol, CRow } from "@coreui/react";
import { useSelector } from "react-redux";

import ProductStatusDropdown from "../ProductStatusDropdown/index";
import { DropDown } from "src/components/buttons/ButtonGroup.js";

export default function StatusBtn({ status, externalId }) {
  const [className, setClassName] = useState("primary");
  const [statusText, setStatusText] = useState("");

  const { loadingStatus } = useSelector(state => state.mshops);

  useEffect(() => {
    function handleAdvertStatusText() {
      switch (status) {
        case "active":
          setClassName("success");
          setStatusText("Ativo");
          break;
        case "paused":
          setClassName("warning");
          setStatusText("Pausado");
          break;
        case "closed":
          setClassName("danger");
          setStatusText("Finalizado");
          break;
        default:
          setClassName("secondary");
          setStatusText("Em Revisão");
          break;
      }
    }
    handleAdvertStatusText();
  }, []);

  return (
    <>
      {loadingStatus ? (
        <CRow style={{ justifyContent: "center" }}>
          <CCol sm={{ size: "auto" }} md={{ size: "auto" }} lg={{ size: "auto" }} xs={{ size: "auto" }}>
            <Loading type="spinningBubbles" color="#054785" height={10} width={30} />
          </CCol>
        </CRow>
      ) : (
        <DropDown
          btnGroupClassName={`btn btn-sm btn-ghost-${className}`}
          style={{ zIndex: "inherit" }}
          direction="down"
          caret={true}
          color="*"
          title={
            <span style={{ marginLeft: "-0.5em" }}>
              <i className="cil-power-standby mr-1" />
              {statusText}
            </span>
          }
        >
          <ProductStatusDropdown action={0} externalId={externalId} status={status} />
          <ProductStatusDropdown action={1} externalId={externalId} status={status} />
          <ProductStatusDropdown action={2} externalId={externalId} status={status} />
          <ProductStatusDropdown action={3} externalId={externalId} status={status} />
        </DropDown>
      )}
      <br />
    </>
  );
}
