import React, { useMemo, useState, useContext } from "react";
import DayInfo from "./DayInfo";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import { CButton } from "@coreui/react";
import { FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import api, { headers } from "src/services/api";
import { CSpinner } from "@coreui/react";
import shippingScheduleContext from "../../shippingScheduleContext";

const DataTable = ({ error, isLoading, info, shippingScheduleType }) => {
  const { selectedAccount } = useContext(shippingScheduleContext);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);

  const [form, setForm] = useState({
    sunday: { hh: "", mm: "" },
    monday: { hh: "", mm: "" },
    tuesday: { hh: "", mm: "" },
    wednesday: { hh: "", mm: "" },
    thursday: { hh: "", mm: "" },
    friday: { hh: "", mm: "" },
    saturday: { hh: "", mm: "" },
  });
  const { sunday, monday, tuesday, wednesday, thursday, friday, saturday } = useMemo(
    () =>
      info?.schedule || {
        sunday: {},
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
      },
    [info?.schedule],
  );
  async function handleSubmitForm() {
    try {
      if (!isLoadingEdit) {
        setIsLoadingEdit(true);
        const url = "/shipping/processing_time_middleend";
        const payload = {
          account_id: selectedAccount.id,
          logistic_type: shippingScheduleType.id,
          processing_times: {},
        };

        const updatePayload = x => {
          if (form[x].hh && form[x].mm) {
            payload.processing_times[x] = `${form[x].hh}:${form[x].mm}`;
          }
        };

        updatePayload("sunday");
        updatePayload("monday");
        updatePayload("tuesday");
        updatePayload("wednesday");
        updatePayload("thursday");
        updatePayload("friday");
        updatePayload("saturday");

        if (Object.keys(payload.processing_times).length) {
          const response = await api.put(url, payload, headers());
          await Swal.fire({
            title: "Atenção!",
            type: "success",
            text: response.data.message,
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      }
    } catch (error) {
      await Swal.fire({
        title: "Atenção!",
        type: "error",
        text: error.response?.data?.message || error.message || error,
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: "Fechar",
      });
    } finally {
      setIsLoadingEdit(false);
    }
  }
  const SubmitBtn = () =>
    showSubmitBtn ? (
      <CButton size="lg" color="success" onClick={handleSubmitForm} className={isLoadingEdit && "disabled"}>
        {isLoadingEdit ? <CSpinner size="sm" /> : <FaCheckCircle />}
        &nbsp;Salvar edições
      </CButton>
    ) : (
      <></>
    );

  return (
    <>
      <ErrorMessage error={error} />
      <Loading isLoading={isLoading} />
      {!error && !isLoading && (
        <table className="table table-responsive bg-gradient-light" style={{ minHeight: "150px" }}>
          <thead>
            <tr>
              <th scope="col">Domingo</th>
              <th scope="col">Segunda</th>
              <th scope="col">Terça</th>
              <th scope="col">Quarta</th>
              <th scope="col">Quinta</th>
              <th scope="col">Sexta</th>
              <th scope="col">Sábado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <DayInfo
                isLoadingEdit={isLoadingEdit}
                setShowSubmit={setShowSubmitBtn}
                form={form}
                setForm={setForm}
                weekDay="sunday"
                weekDayData={sunday}
                type={shippingScheduleType}
              />
              <DayInfo
                isLoadingEdit={isLoadingEdit}
                setShowSubmit={setShowSubmitBtn}
                form={form}
                setForm={setForm}
                weekDay="monday"
                weekDayData={monday}
                type={shippingScheduleType}
              />
              <DayInfo
                isLoadingEdit={isLoadingEdit}
                setShowSubmit={setShowSubmitBtn}
                form={form}
                setForm={setForm}
                weekDay="tuesday"
                weekDayData={tuesday}
                type={shippingScheduleType}
              />
              <DayInfo
                isLoadingEdit={isLoadingEdit}
                setShowSubmit={setShowSubmitBtn}
                form={form}
                setForm={setForm}
                weekDay="wednesday"
                weekDayData={wednesday}
                type={shippingScheduleType}
              />
              <DayInfo
                isLoadingEdit={isLoadingEdit}
                setShowSubmit={setShowSubmitBtn}
                form={form}
                setForm={setForm}
                weekDay="thursday"
                weekDayData={thursday}
                type={shippingScheduleType}
              />
              <DayInfo
                isLoadingEdit={isLoadingEdit}
                setShowSubmit={setShowSubmitBtn}
                form={form}
                setForm={setForm}
                weekDay="friday"
                weekDayData={friday}
                type={shippingScheduleType}
              />
              <DayInfo
                isLoadingEdit={isLoadingEdit}
                setShowSubmit={setShowSubmitBtn}
                form={form}
                setForm={setForm}
                weekDay="saturday"
                weekDayData={saturday}
                type={shippingScheduleType}
              />
            </tr>
          </tbody>
        </table>
      )}
      <SubmitBtn />
    </>
  );
};

export default DataTable;
