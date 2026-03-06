import React, { useContext, useEffect, useMemo } from "react";
import {
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
} from "@coreui/react";
import InputGroupText from "reactstrap/lib/InputGroupText";
import WeekendShippingToggleSelect from "./WeekendShippingToggleSelect";
import styled from "styled-components";
import { FlexConfigContext } from "../../FlexConfigContext";

export default function Form() {
  const {
    currentFlexConfig,
    deliveryWindow,
    setDeliveryWindow,
    capacity,
    setCapacity,
    isSaturdayEnabled,
    setIsSaturdayEnabled,
    isSundayEnabled,
    setIsSundayEnabled,
    cutoffWeekday,
    setCutOffWeekday,
    cutoffSaturday,
    setCutOffSaturday,
    cutoffSunday,
    setCutOffSunday,
  } = useContext(FlexConfigContext);

  const availableHours = useMemo(
    () =>
      currentFlexConfig.cutoff &&
      currentFlexConfig.cutoff.availables?.map((hour) => {
        return {
          value: hour.value,
          label: `${hour.value}:00`,
        };
      }),
    [currentFlexConfig.cutoff]
  );

  const availableCapacities = useMemo(
    () =>
      currentFlexConfig.capacity &&
      currentFlexConfig.capacity.availables?.map((capacity) => {
        return {
          value: capacity,
          label: `Até ${capacity}`,
        };
      }),
    [currentFlexConfig.capacity]
  );

  useEffect(() => {
    if (currentFlexConfig) {
      setDeliveryWindow(currentFlexConfig.adoption?.delivery_window);
      setCapacity(currentFlexConfig.capacity?.selected);
      setCutOffWeekday(currentFlexConfig.cutoff?.selected?.week);
      setIsSaturdayEnabled(
        currentFlexConfig.working_days?.includes("saturday")
      );
      setIsSundayEnabled(currentFlexConfig.working_days?.includes("sunday"));
      setCutOffSaturday(currentFlexConfig.cutoff?.selected?.saturday);
      setCutOffSunday(currentFlexConfig.cutoff?.selected?.sunday);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFlexConfig]);

  return (
    <>
      <FormContainer>
        <div className="secondary-container">
          <StyledInputGroup>
            <CInputGroupPrepend>
              <CInputGroupText>
                <i className="cil-calendar mr-1" /> Postagem
              </CInputGroupText>
            </CInputGroupPrepend>
            <select
              className="custom-select"
              onChange={(e) => setDeliveryWindow(e.target.value)}
              name="delivery_window"
              value={deliveryWindow || 0}
            >
              <option value="0" disabled>
                Selecionar
              </option>
              <option value="same_day">Mesmo dia</option>
              <option value="next_day">Dia seguinte</option>
            </select>
          </StyledInputGroup>

          <StyledInputGroup>
            <CInputGroupPrepend>
              <StyledInputGroupText>
                <i className="cil-truck mr-1" /> Capacidade de envio
              </StyledInputGroupText>
            </CInputGroupPrepend>
            <select
              className="custom-select"
              onChange={(e) => setCapacity(e.target.value)}
              value={capacity}
              name="delivery_window"
              title="Postagem"
            >
              <option value="" disabled>
                Selecionar
              </option>

              {availableCapacities &&
                availableCapacities.map((capacity) => {
                  return (
                    capacity.value !== 0 && (
                      <option key={capacity.value} value={capacity.value}>
                        {capacity.label}
                      </option>
                    )
                  );
                })}

              <option value={0}>Mais de 100</option>
            </select>
          </StyledInputGroup>
        </div>

        <StyledInputGroup>
          <CInputGroupPrepend>
            <StyledInputGroupText>
              <i className="cil-av-timer mr-1" /> Horário limite dias de semana
            </StyledInputGroupText>
          </CInputGroupPrepend>
          <select
            className="custom-select weekdays-select"
            onChange={(e) => setCutOffWeekday(e.target.value)}
            value={cutoffWeekday || 0}
            name="delivery_window"
            title="Postagem"
          >
            <option value="0" disabled>
              Selecionar
            </option>
            {availableHours &&
              availableHours.map((hour) => (
                <option key={hour.value} value={hour.value}>
                  {hour.label}
                </option>
              ))}
          </select>
        </StyledInputGroup>

        <WeekendShippingToggleSelect
          dayOfTheWeekPlural="sábados"
          isChecked={isSaturdayEnabled}
          setIsChecked={setIsSaturdayEnabled}
          availableHours={availableHours}
          cutofftime={Number(cutoffSaturday)}
          setCutOffTime={setCutOffSaturday}
        />
        <WeekendShippingToggleSelect
          dayOfTheWeekPlural="domingos"
          isChecked={isSundayEnabled}
          setIsChecked={setIsSundayEnabled}
          availableHours={availableHours}
          cutofftime={Number(cutoffSunday)}
          setCutOffTime={setCutOffSunday}
        />
      </FormContainer>
    </>
  );
}

const FormContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;

  .secondary-container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: inherit;

    div.input-group {
      flex: 1 1 30%;
    }

    @media (max-width: 1700px) {
      flex-direction: column;
      select {
        min-width: fit-content;
        max-width: fit-content;
      }
    }
  }
`;

const StyledInputGroup = styled(CInputGroup)`
  min-height: 45px;
  > * {
    min-height: 45px;
  }

  select.weekdays-select {
    min-width: fit-content;
    max-width: fit-content;
  }
`;

const StyledInputGroupText = styled(InputGroupText)`
  width: 235px;
`;
