import React               from "react";
import Column              from "./Column";
import SearchBtn           from "./SearchBtn";
import AccountSelect       from "./AccountSelect";
import ScheduleTypesSelect from "./ScheduleTypesSelect";
import { CRow, CCard, CCardHeader, CCardBody, CCardFooter } from "@coreui/react";

const RequiredFilters = () => {
  return (
    <CCard>
      <CCardHeader>
        <h4 className="text-primary">Filtros obrigatórios</h4>
      </CCardHeader>
      <CCardBody>
        <CRow className="d-flex justify-content-center">
          <Column>
            <AccountSelect />
          </Column>
          <Column>
            <ScheduleTypesSelect />
          </Column>
        </CRow>
      </CCardBody>
      <CCardFooter className="d-flex justify-content-center">
        <Column>
          <SearchBtn />
        </Column>
      </CCardFooter>
    </CCard>
  );
};

export default RequiredFilters;
