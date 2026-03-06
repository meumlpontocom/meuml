import React, { useContext }   from "react";
import { Picky }               from "react-picky";
import { CLabel }              from "@coreui/react";
import shippingScheduleTypes   from "../shippingScheduleTypes";
import shippingScheduleContext from "../shippingScheduleContext";

const ScheduleTypesSelect = () => {
  const { selectedScheduleTypes, handleSelectScheduleType } = useContext(shippingScheduleContext);
  return (
    <>
      <CLabel>Selecione os tipos de frete</CLabel>
      <Picky
        multiple
        selectAllMode
        numberDisplayed
        manySelectedPlaceholder="%s selecionados"
        allSelectedPlaceholder="%s selecionados"
        selectAllText="Todos"
        labelKey="label"
        valueKey="id"
        includeFilter={false}
        placeholder="Selecione um tipo"
        options={shippingScheduleTypes}
        value={selectedScheduleTypes}
        onChange={handleSelectScheduleType}
      />
    </>
  )
}

export default ScheduleTypesSelect;
