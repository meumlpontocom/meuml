import { CCard, CCardBody, CCol, CRow } from "@coreui/react";
import { useHistory } from "react-router-dom";
import CopyShippingTermsSwitch from "./CopyShippingTermsSwitch";
import PriceUpdates from "./PriceUpdates";
import Section from "./Section";
import ShippingMode from "./ShippingMode";
import ShippingTerm from "./ShippingTerm";
import Switches from "./Switches";
import Warranty from "./Warranty";

const ConfirmationBody = () => {
  const history = useHistory();
  const from = history.location?.state?.from;
  const copyFromOtherSeller = from === "/replicar-anuncios";

  return (
    <>
      <CRow>
        <CCol xs={12} sm={12} md={6} lg={6}>
          <CCard style={{ height: "100%" }}>
            <Section>Frete</Section>
            <CCardBody>
              <ShippingMode />
              {!copyFromOtherSeller && <CopyShippingTermsSwitch />}
              <CCol style={{ paddingLeft: "0px" }} className={copyFromOtherSeller && "mt-3"}>
                <ShippingTerm />
              </CCol>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} sm={12} md={6} lg={6}>
          <CCard style={{ height: "100%" }}>
            <Section>Anúncios duplicados</Section>
            <CCardBody style={{ minHeight: "196px" }}>
              <Switches />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} sm={12} md={6} lg={6}>
          <CCard style={{ height: "90%" }} className="mt-4">
            <Section>Preço</Section>
            <CCardBody style={{ minHeight: "295px" }}>
              <PriceUpdates />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} sm={12} md={6} lg={6}>
          <CCard style={{ height: "90%" }} className="mt-4">
            <Section>Garantia</Section>
            <CCardBody>
              <Warranty />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default ConfirmationBody;
