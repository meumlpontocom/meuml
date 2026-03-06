import React from "react";
import { Link } from "react-router-dom";
import { CButton, CCardHeader, CCol, CRow } from "@coreui/react";

const Proccess = ({ accordion, process, index, handleClick }) => {
  return (
    <CCardHeader id={"heading" + index} className="divListaProcessos">
      <CRow>
        <CCol sm="6">
          <CButton
            block
            color="ghost-link"
            size="sm"
            className="text-left m-0 p-0 headerListaProcessos"
            onClick={() =>
              handleClick({
                processId: process.process_id,
              })
            }
            aria-expanded={accordion[process.process_id]}
            aria-controls={"collapse" + index}
          >
            <h5 className="tituloProcessos">
              {process.tool_name} - {process.account_name}
            </h5>
            <span>Concluídos: {process.item_finished}</span>
            <span className="text-dark"> | </span>
            <span className="text-success">Bem sucedidos: {process.successes}</span>
            <span className="text-dark"> | </span>
            {process.item_finished - process.successes > 0 ? (
              <>
                <span className="text-danger">
                  Erros: {process.item_finished - process.successes} - Clique aqui para ver os erros
                </span>
                <span className="text-dark"> | </span>
              </>
            ) : (
              <></>
            )}
            <span className="text-dark">Total: {process.item_total}</span>
          </CButton>
        </CCol>
        <CCol sm="6" md="6" className="text-right">
          <span className="m-0 p-0 text-right">
            {!process.date_finished || process.date_finished === "Invalid date" ? (
              <sup>
                iniciado em{" "}
                {new Date(process.date_created).toLocaleDateString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <i className="fa fa-clock-o ml-1" />
              </sup>
            ) : (
              <sup>
                iniciado em{" "}
                {new Date(process.date_created).toLocaleDateString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <i className="fa fa-clock-o ml-1" /> <br /> finalizado em{" "}
                {new Date(process.date_finished).toLocaleDateString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <i className="fa fa-clock-o ml-1" />{" "}
              </sup>
            )}
            <sup>
              {process.tool_name.toUpperCase().match("ETIQUETA") ? (
                <>
                  <br />
                  <Link to="/vendas/etiquetas">Ver etiquetas</Link>
                </>
              ) : (
                <></>
              )}
            </sup>
          </span>
        </CCol>
      </CRow>
    </CCardHeader>
  );
};

export default Proccess;
