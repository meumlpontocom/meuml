import React, { useContext } from "react";
import { CButton, CCol }     from "@coreui/react";
import { FaTimesCircle }     from "react-icons/fa";
import creditsContext        from "../creditsContext";

const CancelOrder = () => {
  const { showForm, setShowForm, isMobile } = useContext(creditsContext);
  return showForm ? (
    <CCol xs="12" sm="6" className="mt-4 mb-5 fade-in">
      <CButton
        size="lg"
        color="secondary"
        onClick={() => setShowForm(false)}
        className={isMobile && "btn-block"}
      >
        <FaTimesCircle />
        &nbsp;Cancelar
      </CButton>
    </CCol>
  ) : (
    <></>
  );
};

export default CancelOrder;
