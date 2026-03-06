import React, { useContext } from "react";
import { FlexConfigContext } from "../FlexConfigContext";
import styled from "styled-components";

export default function ConfigurationData() {
  const { currentFlexConfig } = useContext(FlexConfigContext);
  if (!currentFlexConfig) return null;
  return (
    <ConfigDataContainer>
      <div className="secondary-container">
        <ConfigData>
          <small>CEP</small>
          <strong>{currentFlexConfig.address?.zip_code}</strong>
        </ConfigData>

        <ConfigData>
          <small>Cidade</small>
          <strong>{currentFlexConfig.address?.city?.name}</strong>
        </ConfigData>
      </div>

      <ConfigData>
        <small>Endereço</small>
        <strong>{currentFlexConfig.address?.address_line}</strong>
      </ConfigData>

      <div className="secondary-container">
        <ConfigData>
          <small>Postagem</small>
          <strong>
            {currentFlexConfig.adoption?.delivery_window === "next_day"
              ? "Dia seguinte"
              : "Mesmo dia"}
          </strong>
        </ConfigData>

        <ConfigData>
          <small>Capacidade</small>
          <strong>
            {currentFlexConfig.capacity?.selected === 0
              ? "Mais de 100"
              : `Até ${currentFlexConfig.capacity?.selected}` || null}
          </strong>
        </ConfigData>
      </div>

      <div className="tertiary-container">
        <ConfigData>
          <small>Horário limite semana</small>
          <strong>{currentFlexConfig.cutoff?.selected?.week + "h"}</strong>
        </ConfigData>

        <ConfigData>
          <small>Horário limite sábado</small>
          <strong>
            {currentFlexConfig.working_days?.includes("saturday")
              ? currentFlexConfig.cutoff?.selected?.saturday + "h"
              : "envio desativado"}
          </strong>
        </ConfigData>

        <ConfigData>
          <small>Horário limite domingo</small>
          <strong>
            {currentFlexConfig.working_days?.includes("sunday")
              ? currentFlexConfig.cutoff?.selected?.sunday + "h"
              : "envio desativado"}
          </strong>
        </ConfigData>
      </div>

      <ConfigData>
        <small>Zonas selecionadas</small>
        <strong>
          {currentFlexConfig?.zones &&
            currentFlexConfig.zones
              .filter((zone) => zone.selected)
              .map((zone, index) => (
                <span key={index}>
                  {zone.label}
                  {index + 1 <
                    currentFlexConfig.zones.filter((zone) => zone.selected)
                      .length && ", "}
                </span>
              ))}
        </strong>
      </ConfigData>
    </ConfigDataContainer>
  );
}

const ConfigDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .secondary-container {
    width: 100%;
    display: flex;
    gap: inherit;

    @media (max-width: 500px) {
      flex-direction: column;
    }
  }

  .tertiary-container {
    width: 100%;
    display: flex;
    gap: inherit;

    @media (max-width: 500px) {
      flex-direction: column;
    }
  }
`;

const ConfigData = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  background-color: #ebedef;
  border-left: 4px solid #d8dbe0;
  border-radius: 4px;
  width: 100%;
`;
