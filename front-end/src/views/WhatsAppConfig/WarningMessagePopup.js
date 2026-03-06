import React, { useEffect, useState } from "react";
import { FaTimesCircle }              from "react-icons/fa";
import { USER_NAME }                  from "src/services/auth";
import { 
  CButton, 
  CCol, 
  CModal, 
  CModalHeader, 
  CModalBody,
  CModalFooter 
} from "@coreui/react";

const WarningMessagePopup = () => {
  const username = localStorage.getItem(USER_NAME);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <CCol xs="12">
      <CModal show={show} centered backdrop={true}>
        <CModalHeader>
          <h3>Aviso!</h3>
        </CModalHeader>
        <CModalBody>
          <p>Caro {username || "usuário"}, as notificações via WhatsApp estão temporariamente desativadas.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={()=> setShow(false)}>
            <FaTimesCircle />&nbsp;Fechar
          </CButton>
        </CModalFooter>
      </CModal>
    </CCol>
  );
};

export default WarningMessagePopup;
