import React, { useState, useContext, useMemo, useEffect }        from "react";
import { v4 as uuidv4 }                                           from "uuid";
import classNames                                                 from "classnames";
import { toast }                                                  from "react-toastify";
import { FaCheckCircle }                                          from "react-icons/fa";
import { createMlAdvertContext }                                  from "../createMlAdvertContext";
import { CreatingVariation }                                      from "../molecules";
import { CRow, CCol, CCollapse, CButton, CCardBody, CCardFooter } from "@coreui/react";
import {
  Card,
  CardHeader,
  CreatedVariations,
  NoVariationRegistered,
  VariationsSwitch,
  ToggleVariationCreationBtn,
}                                                                 from "../atoms";

// Used on initialization and cleanup
const variationFormInitialState = {
  images: [],
  attributes: {},
  availableQuantity: 0,
};

const Variations = () => {
  const { form, setVariation } = useContext(createMlAdvertContext);

  const shouldRenderComponent = useMemo(() => !!form.attributes?.length, [form.attributes]);
  const saveNewVariation = () => setVariation({ variation: { _id: uuidv4(), ...variationForm } });

  const [variationForm, setVariationForm] = useState(() => variationFormInitialState);
  const [createVariation, setCreateVariation] = useState(() => false);
  const [collapseVariations, setCollapseVariations] = useState(() => false);

  const isFooterHidden = classNames({ visible: createVariation, invisible: !createVariation });

  // Set collapse to true if form.variations.length
  useEffect(() => {
    if (form.variations.length) setCollapseVariations(true);
  }, [form.variations.length]);

  // Called on save variation and on cancel creation
  function resetVariationForm() {
    setCreateVariation(false);
    setVariationForm(variationFormInitialState);
  }

  const validateVariationForm = () => {
    const atLeastOneValidAttribute = () => !!Object.keys(variationForm.attributes)?.length;
    const atLeastOneValidImage = () => !!variationForm.images.length;
    const atLeastOneItemAvailable = () => !!variationForm.availableQuantity;

    return atLeastOneValidAttribute()
      ? atLeastOneValidImage()
        ? atLeastOneItemAvailable()
          ? true // All validations passed
          : "Você precisa disponibilizar ao menos um item para criar a variação."
        : "Certifique-se de escolher pelo menos uma imagem para sua nova variação."
      : "Para criar uma variação válida, você precisa diferenciar ao menos um atributo do produto original.";
  };

  function handleSaveVariation() {
    const variationFormIsValid = validateVariationForm();
    if (typeof variationFormIsValid === "boolean") {
      saveNewVariation();
      resetVariationForm();
    } else {
      toast(
        variationFormIsValid,
        {
          type: toast.TYPE.WARNING,
        },
      );
    }
  }

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary">
      <CardHeader
        title="Variações"
        subtitle={
          <VariationsSwitch
            collapseVariations={collapseVariations}
            setCollapseVariations={setCollapseVariations}
          />
        }
      />
      <CCollapse show={collapseVariations}>
        <CCardBody>
          <CreatedVariations />
          <ToggleVariationCreationBtn
            btnType="confirm"
            createVariation={createVariation}
            callback={() => setCreateVariation(current => !current)}
          />
          <NoVariationRegistered
            isCreatingVariation={createVariation}
            hasCreatedVariation={!!form.variations?.length}
          />
          <CreatingVariation
            variationForm={variationForm}
            createVariation={createVariation}
            setVariationForm={setVariationForm}
          />
        </CCardBody>
        <CCardFooter className={isFooterHidden}>
          <CRow>
            <CCol xs="6">
              <CButton color="success" onClick={handleSaveVariation}>
                Criar variação&nbsp;<FaCheckCircle />
              </CButton>
            </CCol>
            <CCol xs="6">
              <ToggleVariationCreationBtn
                btnType="cancel"
                callback={resetVariationForm}
                createVariation={createVariation}
              />
            </CCol>
          </CRow>
        </CCardFooter>
      </CCollapse>
    </Card>
  );
};

export default Variations;
