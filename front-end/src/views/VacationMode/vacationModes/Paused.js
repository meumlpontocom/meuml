import React, { useContext } from "react";
import { CRow, CCol, CBadge, CFormGroup, CLabel, CInput, CFormText, CTooltip } from "@coreui/react";
import vacationContext from "../vacationContext";
import TimeOptions from "./TimeOptions";

const Paused = () => {
  const {
    selectedAccounts,
    scrollBottom,
    pausedStartDateRef,
    pausedEndDateRef,
    pauseAdvertsState: { startDate, endDate, startTime, endTime, pause_full },
    setPauseAdvertsState,
  } = useContext(vacationContext);

  const selectedAccountTitle = selectedAccounts.map(account => account.name);

  function handleTimeChange({ target: { value, id } }) {
    setPauseAdvertsState(previous => ({
      ...previous,
      [id]: value,
    }));
  }

  const AccountIndicator = () => {
    const handleClick = () => {
      window.scrollTo(0, 0);
    };
    return (
      <CTooltip content={selectedAccountTitle}>
        <b className="text-info pointer" onClick={() => handleClick()}>
          <u>contas selecionadas</u>
        </b>
      </CTooltip>
    );
  };

  function onClickVacationStartLink() {
    pausedStartDateRef.current.focus();
    scrollBottom(0);
  }

  function onClickVacationEndLink() {
    pausedEndDateRef.current.focus();
    scrollBottom(0);
  }

  const Full = () => (
    <CBadge color="success">
      <i className="cil-bolt mr-1" />F U L L
    </CBadge>
  );

  return (
    <CRow>
      <CCol xs={12}>
        <p className="text-dark">
          <i className="cil-info mr-1" />
          Os anúncios atualmente ativos nas <AccountIndicator /> serão pausados{" "}
          <u onClick={onClickVacationStartLink} className="text-info pointer">
            <b>no início das férias.</b>
          </u>{" "}
          Ao retornar das Férias (
          <u className="text-info pointer" onClick={onClickVacationEndLink}>
            <b>término das férias</b>
          </u>
          ) os anúncios serão reativados.
        </p>
      </CCol>
      <CCol xs={12} sm={10} md={6}>
        <CFormGroup>
          <CLabel htmlFor="nf-email">Início das férias</CLabel>
          <CInput
            innerRef={pausedStartDateRef}
            value={startDate}
            onChange={({ target: { value } }) =>
              setPauseAdvertsState(previous => ({ ...previous, startDate: value }))
            }
            type="date"
            id="date-vacation-start"
            name="date-vacation-start"
          />
          <select id="startTime" value={startTime} onChange={handleTimeChange} className="form-control mt-1">
            <TimeOptions />
          </select>
          <CFormText className="help-block">Deixe em branco para começar imediatamente</CFormText>
        </CFormGroup>
      </CCol>
      <CCol xs={12} sm={10} md={6}>
        <CFormGroup>
          <CLabel htmlFor="nf-password">Término das férias</CLabel>
          <CInput
            innerRef={pausedEndDateRef}
            value={endDate}
            onChange={({ target: { value } }) =>
              setPauseAdvertsState(previous => ({ ...previous, endDate: value }))
            }
            type="date"
            id="date-vacation-end"
            name="date-vacation-end"
          />
          <select id="endTime" value={endTime} onChange={handleTimeChange} className="form-control mt-1">
            <TimeOptions />
          </select>
          <CFormText className="help-block">
            Deixe em branco para desativar o modo férias manualmente
          </CFormText>
        </CFormGroup>
      </CCol>
      <CFormGroup style={{ marginTop: "25px", paddingLeft: "18px" }}>
        <input
          id="pause-full-ads"
          name="pause-full-ads"
          type="checkbox"
          checked={pause_full}
          className="mr-2"
          onChange={({ target: { checked } }) =>
            setPauseAdvertsState(previous => ({ ...previous, pause_full: checked }))
          }
        />
        <CLabel htmlFor="pause-full-ads">
          Marque para também pausar anúncios com envio <Full />
        </CLabel>
      </CFormGroup>
    </CRow>
  );
};
export default Paused;
