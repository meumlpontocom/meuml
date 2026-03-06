import "./index.css";
import React from "react";
import InvoiceForm from "./InvoiceForm";
import { Redirect } from "react-router-dom";
import CreditCardForm from "./CreditCardForm";
import SelectDocumentType from "./SelectDocumentType";
import LoadPageHandler from "../../../../components/Loading";

export default function Form({ history, loading, setLoading, formStage, setFormStage }) {
  const [documentType, setDocumentType] = React.useState("");

  const HandleRedirect = () => {
    return <Redirect to="/assinaturas/planos" />;
  };

  const selectDocumentType = (type) => {
    setDocumentType(type);
    setFormStage(1);
  };

  return (
    <LoadPageHandler
      marginTop="40px"
      isLoading={loading}
      render={
        <>
          {!formStage ? (
            <SelectDocumentType selectDocumentType={selectDocumentType} />
          ) : formStage === 1 ? (
            <InvoiceForm
              history={history}
              setFormStage={setFormStage}
              documentType={documentType}
            />
          ) : formStage === 2 ? (
            <CreditCardForm
              history={history}
              setLoading={setLoading}
              setFormStage={setFormStage}
            />
          ) : (
                  <HandleRedirect />
                )}
        </>
      }
    />
  );
}
