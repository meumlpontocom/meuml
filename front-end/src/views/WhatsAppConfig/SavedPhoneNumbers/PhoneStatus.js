import React              from "react";
import { CCol, CPopover }               from "@coreui/react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function PhoneStatus({ isConfirmed }) {
  return (
    <CCol xs="6" className="text-right">
      {isConfirmed ? (
        <h5 className="text-success">
          <FaCheckCircle className="mr-2" />
          Confirmado
        </h5>
      ) : (
        <CPopover content="Este número de telefone não foi confirmado.">
          <h5 className="text-danger">
            <strong>
              <FaTimesCircle className="mr-2" />
              Não confirmado
            </strong>
          </h5>
        </CPopover>
      )}
    </CCol>
  );
}

export default PhoneStatus;
