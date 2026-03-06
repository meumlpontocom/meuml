import React, { useCallback, useContext, useMemo } from "react";
import { VariationAvailableQuantity }              from "../atoms";
import PropTypes                                   from "prop-types";
import { CCol, CLabel, CRow }                      from "@coreui/react";
import { createMlAdvertContext }                   from "../createMlAdvertContext";
import UploadedFiles                               from "../molecules/UploadedFiles";
import VariationAttributes                         from "../molecules/VariationAttributes";
import FileUploadInput                             from "src/views/Anuncios/Create/molecules/inputs/FileUploadInput";

const CreatingVariation = ({ createVariation, variationForm, setVariationForm }) => {
  const { form } = useContext(createMlAdvertContext);
  const advertTitle = useMemo(() => form.title, [form.title]);

  const handleFormDataUpdate = useCallback(
    ({ id, value }) => {
      setVariationForm(currentVariationState => {
        return {
          ...currentVariationState,
          [id]: value,
        };
      });
    },
    [setVariationForm],
  );

  return createVariation ? (
    <CRow>
      <CCol xs="12" className="mb-4">
        <h5>
          Criar variação de <span className="text-info">{advertTitle.toUpperCase()}</span>
        </h5>
      </CCol>
      <CCol xs="12">
        <VariationAvailableQuantity variationForm={variationForm} setVariationForm={handleFormDataUpdate} />
      </CCol>
      <CCol xs="12" className="mt-3">
        <CLabel htmlFor="upload-variation-img">Imagens</CLabel>
        <UploadedFiles images={variationForm.images} />
        <FileUploadInput
          id="upload-variation-img"
          images={variationForm.images}
          setFormData={handleFormDataUpdate}
        />
      </CCol>
      <CCol xs="12" className="mt-3">
        <VariationAttributes setFormData={handleFormDataUpdate} variationForm={variationForm} />
      </CCol>
    </CRow>
  ) : (
    <></>
  );
};

CreatingVariation.propTypes = {
  createVariation: PropTypes.bool.isRequired,
  variationForm: PropTypes.object.isRequired,
  setVariationForm: PropTypes.func.isRequired,
};

export default CreatingVariation;
