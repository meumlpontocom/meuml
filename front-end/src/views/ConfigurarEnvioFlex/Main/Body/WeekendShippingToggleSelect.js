import React from "react";
import {
  CInputGroup,
  CInputGroupAppend,
  CInputGroupPrepend,
  CInputGroupText,
} from "@coreui/react";
import PropTypes from "prop-types";
import styled from "styled-components";

const WeekendShippingToggleSelect = ({
  dayOfTheWeekPlural,
  isChecked,
  setIsChecked,
  availableHours,
  cutofftime,
  setCutOffTime,
}) => {
  return (
    <Container>
      <div>
        <StyledInputGroup>
          <CInputGroupPrepend>
            <StyledInputGroupText>
              <i className="cil-av-timer mr-1" />
              {`Horário limite ${dayOfTheWeekPlural}`}
            </StyledInputGroupText>
          </CInputGroupPrepend>
          <select
            disabled={!isChecked}
            className="custom-select weekend-select"
            onChange={(e) => setCutOffTime(e.target.value)}
            value={cutofftime || 0}
            name="delivery_window"
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
          <StyledCInputGroupAppend>
            <StyledInputGroupText>
              <ToggleContainer>
                <StyledInputGroupText>
                  <small>
                    <strong>{`Envio aos ${dayOfTheWeekPlural}: `}</strong>
                  </small>
                  <label
                    htmlFor={`${dayOfTheWeekPlural}-shipping-checkbox`}
                    className="user-select-none mr-2"
                  >
                    Desativado
                  </label>
                  <div className="custom-control custom-switch d-flex">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id={`${dayOfTheWeekPlural}-shipping-checkbox`}
                      checked={isChecked}
                      onChange={() => setIsChecked(!isChecked)}
                    />
                    <label
                      className="custom-control-label user-select-none"
                      htmlFor={`${dayOfTheWeekPlural}-shipping-checkbox`}
                    >
                      Ativado
                    </label>
                  </div>
                </StyledInputGroupText>
              </ToggleContainer>
            </StyledInputGroupText>
          </StyledCInputGroupAppend>
        </StyledInputGroup>
      </div>
    </Container>
  );
};

export default WeekendShippingToggleSelect;

WeekendShippingToggleSelect.propTypes = {
  dayOfTheWeekPlural: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  setIsChecked: PropTypes.func.isRequired,
  availableHours: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string,
    })
  ),
  cutofftime: PropTypes.number,
  setCutOffTime: PropTypes.func,
};

const Container = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 1280px) {
    flex-direction: column;
    gap: 0;
  }
`;

const ToggleContainer = styled.div`
  min-width: 220px;

  label {
    margin: 0;
    padding: 0;
  }
`;

const StyledInputGroup = styled(CInputGroup)`
  min-height: 45px;
  > * {
    min-height: 45px;
  }

  select.weekend-select {
    /* min-width: 80px; */
    max-width: fit-content;
    width: fit-content;
  }

  @media (max-width: 500px) {
    min-width: 100%;
  }
`;

const StyledInputGroupText = styled(CInputGroupText)`
  min-width: 235px;
  display: flex;
  align-items: center;
  padding: 0 8px;

  small {
    text-align: left;
    min-width: 120px;
    justify-self: flex-start;

    @media (max-width: 500px) {
      display: none;
    }
  }
`;

const StyledCInputGroupAppend = styled(CInputGroupAppend)`
  .input-group-text {
    min-width: 328px;

    @media (max-width: 500px) {
      min-width: unset;
    }
  }
`;
