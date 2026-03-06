import React            from "react";
import { CCol, CAlert } from "@coreui/react";

const ErrorMessage = ({ error }) => {
  const translateError = message => {
    const errors = {
      "Seller does not have the specified logistic type":
        "A conta informada não possui este tipo de logística habilitado.",
    };
    return errors[message] || message;
  }
  return error ? (
    <CCol xs="12" className="mb-5 mt-3">
      <CAlert color="danger">
        <em>
          <p>
            {typeof error === "object"
              ? translateError(error.response?.data?.details?.message) ||
                translateError(error.response?.data?.message) ||
                error.message
              : error}
          </p>
        </em>
      </CAlert>
    </CCol>
  ) : (
    <></>
  );
};

export default ErrorMessage;
