import { CCol, CFormGroup } from "@coreui/react";
import NameInput            from "./NameInput";
import EmailInput           from "./EmailInput";
import ZipCodeInput         from "./ZipCodeInput";
import DistrictInput        from "./DistrictInput";
import ComplementInput      from "./ComplementInput";
import NumberInput          from "./NumberInput";
import StreetInput          from "./StreetInput";
import CpfCnpj              from "./CpfCnpj";
import CnpjInscription      from "./CnpjInscription";

function Form({ type }) {
  return (
    <CFormGroup>
      <CCol xs={12} className="text-left mb-2">
        <NameInput />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <EmailInput />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <CpfCnpj type={type} />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <CnpjInscription type={type} />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <ZipCodeInput />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <StreetInput />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <NumberInput />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <ComplementInput />
      </CCol>
      <CCol xs={12} className="text-left mb-2">
        <DistrictInput />
      </CCol>
    </CFormGroup>
  );
}

export default Form;
