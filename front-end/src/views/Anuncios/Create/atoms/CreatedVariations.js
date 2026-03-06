import React, { useContext, useCallback }     from "react";
import { CImg, CRow, CCol, CCard, CCardBody } from "@coreui/react";
import DeleteVariation                        from "./DeleteVariation";
import { createMlAdvertContext }              from "../createMlAdvertContext";

const CreatedVariations = () => {
  const { form, categoryTree } = useContext(createMlAdvertContext);
  const getAttributeName = useCallback(
    id => categoryTree.find(attribute => attribute?.id === id)?.name || "",
    [categoryTree],
  );
  return (
    <CRow>
      {
        form.variations.length ? form.variations.map(variation => {
          const variationAttributesArray = Object.values(variation.attributes);
          const firstAttributeId = String(variationAttributesArray[0].id);
          const firstAttributeName = getAttributeName(firstAttributeId);
          const firstAttributeValueName = variationAttributesArray[0].value_name;
          return (
            <CCol xs="12" sm="6" md="3" key={variation._id}>
              <CCard className="text-dark border-info" id="created-variations-card">
                <CRow gutters={false}>
                  <CCol md="4">
                    {variation.images.length && (
                      <CImg
                        height="120"
                        width="120"
                        className="card-img border-secondary"
                        src={URL.createObjectURL(variation.images[0])}
                      />
                    )}
                  </CCol>
                  <CCol md="8">
                    <CCardBody>
                      <h5>
                        <span className="text-left">
                          <strong className="text-info">{firstAttributeName.toUpperCase()}:&nbsp;</strong>{firstAttributeValueName}
                        </span>
                        <span className="text-right">
                          <DeleteVariation id={variation._id} />
                        </span>
                      </h5>
                      <p>Quantidade: {variation.availableQuantity}</p>
                    </CCardBody>
                  </CCol>
                </CRow>
              </CCard>
            </CCol>
          );
        }) : <></>
      }
    </CRow>
  );
};

export default CreatedVariations;
