import React, { useState, useCallback } from "react";
import { FaTimesCircle } from "react-icons/fa";
import {
  CButton,
  CRow,
  CCol,
  CLabel,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from "@coreui/react";

const DayInfo = ({ weekDay, weekDayData, type, form, setForm, setShowSubmit }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAvailableDays = useCallback(sla_string => {
    const days = [];
    sla_string.match("same_day") && days.push("HOJE");
    sla_string.match("sunday") && days.push("DOM");
    sla_string.match("monday") && days.push("SEG");
    sla_string.match("tuesday") && days.push("TER");
    sla_string.match("wednesday") && days.push("QUA");
    sla_string.match("thursday") && days.push("QUI");
    sla_string.match("satuday") && days.push("SAB");
    return days;
  }, []);
  const AvailableDaysBadges = ({ availableDays }) =>
    availableDays.map(day => (
      <CBadge key={day} color="success" className="ml-1 mt-1">
        {day}
      </CBadge>
    ));
  const Info = ({ label, value }) =>
    value ? (
      <p style={{ lineHeight: "13px" }}>
        {label}:&nbsp;{value}
      </p>
    ) : (
      <></>
    );
  const handleInputUpdateClick = useCallback(
    ({ id, operation }) => {
      const operationResult =
        operation === "sum" ? Number(form[weekDay][id]) + 1 : Number(form[weekDay][id] - 1);
      const validateMin =
        operation !== "sum"
          ? operationResult > 0
            ? operationResult
            : id === "hh"
            ? 23
            : 59
          : operationResult;
      const validateMax =
        operation === "sum"
          ? id === "hh"
            ? validateMin > 23
              ? 0
              : validateMin
            : validateMin > 59
            ? 0
            : validateMin
          : validateMin;
      const result = validateMax === 0 ? "00" : String(validateMax > 9 ? validateMax : `0${validateMax}`);

      setForm(current => ({ ...current, [weekDay]: { ...form[weekDay], [id]: result } }));
    },
    [form, setForm, weekDay],
  );
  const Input = ({ placeholder, id }) => (
    <CInputGroup>
      <CInputGroupPrepend
        onClick={() => handleInputUpdateClick({ id, operation: "sub" })}
        className="pointer"
      >
        <CInputGroupText>-</CInputGroupText>
      </CInputGroupPrepend>
      <CInput size="lg" id={id} type="text" value={form[weekDay][id]} placeholder={placeholder} />
      <CInputGroupPrepend
        onClick={() => handleInputUpdateClick({ id, operation: "sum" })}
        className="pointer"
      >
        <CInputGroupText>+</CInputGroupText>
      </CInputGroupPrepend>
    </CInputGroup>
  );
  const Form = () => (
    <CRow className="d-flex justify-content-center">
      <CCol xs="5">
        <CLabel>
          Hora
          <Input placeholder="13" max="23" id="hh" />
        </CLabel>
      </CCol>
      <div className="d-flex align-items-center">:</div>
      <CCol xs="5">
        <CLabel>
          Minuto
          <Input placeholder="50" max="59" id="mm" />
        </CLabel>
      </CCol>
    </CRow>
  );
  const EditableInfo = ({ label, value }) => {
    function handleShowModalClick() {
      setShowModal(true);
    }
    return value ? (
      <p style={{ lineHeight: "13px" }} className="pointer" onClick={handleShowModalClick}>
        {label}:&nbsp;{value}
      </p>
    ) : (
      <></>
    );
  };

  if (!weekDayData.work) {
    return (
      <td className="text-center">
        <FaTimesCircle className="text-danger h2" />
      </td>
    );
  }

  function handleSaveForm() {
    setShowModal(false);
    setShowSubmit(true);
  }
  function handleCancelForm() {
    setShowModal(false);
    setForm({ ...form, [weekDay]: { hh: "", mm: "" } });
  }

  return (
    <td>
      {weekDayData.detail?.length && (
        <>
          <CModal
            alignment="center"
            keyboard={false}
            portal={false}
            show={showModal}
            visible={true}
            onClose={handleCancelForm}
          >
            <CModalHeader>
              <CModalTitle>Atualizar horário</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <Form handleClick={handleAvailableDays} />
            </CModalBody>
            <CModalFooter>
              <CButton color="primary" onClick={handleSaveForm}>
                Salvar
              </CButton>
              <CButton color="secondary" onClick={handleCancelForm}>
                Cancelar
              </CButton>
            </CModalFooter>
          </CModal>
          {type?.id === "cross_docking" || type?.id === "xd_drop_off" ? (
            <EditableInfo label="Horário de corte" value={weekDayData.detail[0].cutoff} />
          ) : (
            <Info label="Horário de corte" value={weekDayData.detail[0].cutoff} />
          )}
          <Info label="Transportadora" value={weekDayData.detail[0].carrier.name} />
          <Info label="Motorista" value={weekDayData.detail[0].driver.name} />
          <Info label="Placa do veículo" value={weekDayData.detail[0].vehicle.license_plate} />
          {weekDayData.detail[0].vehicle.only_for_today && (
            <Info label="Veículo disponível" value="apenas p/ hoje" />
          )}
          <Info label="Tipo do veículo" value={weekDayData.detail[0].vehicle.vehicle_type} />
          <Info label="De" value={weekDayData.detail[0].from} />
          <Info label="Para" value={weekDayData.detail[0].to} />
          <Info
            label="Disponibilidade"
            value={<AvailableDaysBadges availableDays={handleAvailableDays(weekDayData.detail[0].sla)} />}
          />
        </>
      )}
    </td>
  );
};

export default DayInfo;
