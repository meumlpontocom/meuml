import React, { useContext } from "react";
import { CRow, CCol, CFormGroup, CLabel, CInput, CFormText, CTooltip } from "@coreui/react";
import vacationContext from "../vacationContext";
import TimeOptions from "./TimeOptions";

const AutomaticShippingTerm = () => {
  const {
    selectedAccounts,
    scrollBottom,
    shippingTermStartDateRef,
    shippingTermEndDateRef,
    shippingTermState: { startDate, endDate, startTime, endTime },
    setShippingTermState,
  } = useContext(vacationContext);

  function handleTimeChange({ target: { value, id } }) {
    setShippingTermState(previous => ({
      ...previous,
      [id]: value,
    }));
  }

  function handleClickEndVacation() {
    shippingTermEndDateRef.current.focus();
    scrollBottom(0);
  }

  function handleClickSelectedAccount() {
    window.scrollTo(0, 0);
  }

  return (
    <CRow>
      <CCol xs={12}>
        <p className="text-dark">
          <i className="cil-info mr-1" />O sistema irá adicionar prazo de envio nos seus anúncios ativos (
          <CTooltip content={selectedAccounts.map(({ name }) => `${name} `)}>
            <b className="text-info pointer" onClick={handleClickSelectedAccount}>
              apenas das contas selecionadas
            </b>
          </CTooltip>
          ), e irá atualizar este prazo todos os dias de forma automática de acordo com a data definida
          abaixo,{" "}
          <b className="text-info pointer" onClick={handleClickEndVacation}>
            em data de término
          </b>
          .
        </p>
        <p className="text-dark">
          <i className="cil-info mr-1" />
          <span className="text-danger mr-1">
            NÃO ATIVE o Modo Férias nesta opção (Prazo de Envio) se os seus anúncios já tiverem prazo de envio
            configurado!
          </span>
          Use somente se você não usa o prazo de envio. Qual o motivo? Se usar o Modo Férias na opção de Prazo
          de Envio, o prazo calculado pelo sistema vai sobrepor o prazo que você já tem configurado nos seus
          anúncios. Ao final do período de férias, todos os seus anúncios ficarão sem nenhum prazo configurado
          - você vai perder as informações anteriores. Portanto, não use esta modalidade sem antes estar
          ciente desta condição!
        </p>
      </CCol>
      <CCol xs={12} sm={6}>
        <CFormGroup>
          <CLabel htmlFor="date-vacation-start">Início das férias</CLabel>
          <CInput
            innerRef={shippingTermStartDateRef}
            value={startDate}
            onChange={({ target: { value } }) =>
              setShippingTermState(previous => ({ ...previous, startDate: value }))
            }
            type="date"
            id="date-vacation-start"
            name="date-vacation-start"
          />
          <CFormText className="help-block">Deixe em branco para começar imediatamente</CFormText>
        </CFormGroup>
        <select id="startTime" value={startTime} onChange={handleTimeChange} className="form-control mt-1">
          <TimeOptions />
        </select>
      </CCol>
      <CCol xs={12} sm={6}>
        <CFormGroup>
          <CLabel htmlFor="date-vacation-end">Término das férias</CLabel>
          <CInput
            innerRef={shippingTermEndDateRef}
            value={endDate}
            onChange={({ target: { value } }) =>
              setShippingTermState(previous => ({ ...previous, endDate: value }))
            }
            type="date"
            id="date-vacation-end"
            name="date-vacation-end"
          />
          <CFormText className="help-block">Este é um campo obrigatório</CFormText>
        </CFormGroup>
        <select id="endTime" value={endTime} onChange={handleTimeChange} className="form-control mt-1">
          <TimeOptions />
        </select>
      </CCol>
    </CRow>
  );
};

export default AutomaticShippingTerm;
