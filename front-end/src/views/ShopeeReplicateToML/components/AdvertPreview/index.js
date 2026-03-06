import React, { useContext }            from "react";
import classNames                       from "classnames";
import Caroussel                        from "./Caroussel";
import CardHeader                       from "./CardHeader";
import { CRow, CCol, CCard, CCardBody } from "@coreui/react";
import { FaTruck }                      from "react-icons/fa";
import CategoryAttributes               from "./CategoryAttributes";
import useIsXsDisplay                   from "../../hooks/useIsXsDisplay";
import shopeeReplicateToMLContext       from "../../shopeeReplicateToMLContext";
import useTranslatedCondition           from "../../hooks/useTranslatedCondition";
import useTranslateShippingModeName     from "src/helpers/translateShippingModeName";

const AdvertPreview = () => {
  const translate             = useTranslateShippingModeName();
  const isSmallDisplay        = useIsXsDisplay();
  const translatedCondition   = useTranslatedCondition();
  const { form }              = useContext(shopeeReplicateToMLContext);
  const freeShippingClassName = classNames(!form.basic.shipping.free_shipping ? "text-danger" : "text-success");
  return (
    <CRow className="d-flex align-items-center justify-content-center">
      <CCol xs={12}>
        <CCard>
          <CardHeader />
          <CCardBody>
            <CRow>
              <CCol xs={12} md={7}>
                <Caroussel />
              </CCol>
              <CCol
                xs={12}
                md={5}
                className={isSmallDisplay && "mt-3"}
                style={{ border: "solid gray 1px", borderRadius: "5px" }}
              >
                <CRow>
                  <CCol xs={12} className="mb-2 mt-3">
                    <p className="text-muted">Condição: {translatedCondition}</p>
                  </CCol>
                  <CCol xs={12} className="mb-3">
                    <h4>{form.basic.title}</h4>
                  </CCol>
                  <CCol xs={12} className="mb-5">
                    <h2>R${form.basic.price}</h2>
                  </CCol>
                  <CCol xs={12} className="mb-3">
                    <h5 className={freeShippingClassName}>
                      <FaTruck className="mb-1" />&nbsp;
                      {!form.basic.shipping.free_shipping ? "Sem" : "Com"} Frete Grátis
                    </h5>
                    <h6>{translate(form.basic.shipping.mode)}</h6>
                  </CCol>
                  <CCol xs={12}>
                    <h5>
                      Disponível:&nbsp;
                      <strong>{form.basic.available_quantity}&nbsp;{form.basic.available_quantity > 1 ? "unidades" : "unidade"}</strong>
                    </h5>
                  </CCol>
                </CRow>
              </CCol>
              <CCol className="mt-5">
                <CategoryAttributes />
              </CCol>
              <CCol xs={12} className="mt-5">
                <h3 className="text-info">Descrição</h3>
                <p>{form.basic.description}</p>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default AdvertPreview;
