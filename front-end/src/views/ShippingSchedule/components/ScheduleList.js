import React, { useContext, useCallback } from "react";
import DataTable                          from "./DataTable";
import { CRow, CCol }                     from "@coreui/react";
import shippingScheduleTypes              from "../shippingScheduleTypes";
import shippingScheduleContext            from "../shippingScheduleContext";

const ScheduleList = () => {
  const { shippingSchedules } = useContext(shippingScheduleContext);
  const getItem    = useCallback(id => shippingSchedules[id], [shippingSchedules]);
  const shouldHide = useCallback(item => !item.error && !item.isLoading && !item.schedule, []);
  return (
    <CRow className="d-flex justify-content-md-left justify-content-middle">
      {shippingScheduleTypes.map(type => {
        const item = getItem(type.id);
        return shouldHide(item) ? <></> : (
          <CCol
            key={type.id}
            className="mt-4 mb-5"
            xs="12"
            md={item.schedule?.wednesday ? 12 : 6}
          >
            <>
              <h5
                style={{ padding: "15px", marginBottom: 0 }}
                className={`${item.schedule?.wednesday ? "bg-gradient-info" : "text-muted"}`}
              >
                {String(type.label).toUpperCase()}
              </h5>
              <DataTable
                info={item} 
                error={item.error} 
                shippingScheduleType={type} 
                isLoading={item.isLoading || false} 
              />
            </>
          </CCol>
        );
      })}
    </CRow>
  );
};

export default ScheduleList;
