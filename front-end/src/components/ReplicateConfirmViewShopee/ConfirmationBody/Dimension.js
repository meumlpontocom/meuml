import { CCard, CCardBody, CCol, CRow } from "@coreui/react";
import Section from "./Section";
import { Input } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setAdvertDimensionHeight,
  setAdvertDimensionWidth,
  setAdvertDimensionLength,
} from "src/redux/actions/_replicationActions";
import { useRef } from "react";

const DimensionSection = () => {
  const dispatch = useDispatch();
  const selectedAdverts = useSelector(state => state.advertsReplication.selectedAdverts);

  const heightInputRef = useRef();
  const widthInputRef = useRef();
  const lengthInputRef = useRef();

  function handleSetDimensionHeight(value) {
    for (const selectedAdvert of selectedAdverts) {
      const originalAdDimensions = selectedAdvert?.advertData?.seller_package_dimensions ?? {};
      const originalAdHasHeight = !!originalAdDimensions.height;

      if (originalAdHasHeight) continue;

      dispatch(
        setAdvertDimensionHeight({
          id: selectedAdvert.id,
          height: Number(value),
        }),
      );
    }
  }

  function handleSetDimensionWidth(value) {
    for (const selectedAdvert of selectedAdverts) {
      const originalAdDimensions = selectedAdvert?.advertData?.seller_package_dimensions ?? {};
      const originalAdHasWidth = !!originalAdDimensions.width;

      if (originalAdHasWidth) continue;

      dispatch(
        setAdvertDimensionWidth({
          id: selectedAdvert.id,
          width: Number(value),
        }),
      );
    }
  }

  function handleSetDimensionLength(value) {
    for (const selectedAdvert of selectedAdverts) {
      const originalAdDimensions = selectedAdvert?.advertData?.seller_package_dimensions ?? {};
      const originalAdHasLength = !!originalAdDimensions.length;

      if (originalAdHasLength) continue;

      dispatch(
        setAdvertDimensionLength({
          id: selectedAdvert.id,
          length: Number(value),
        }),
      );
    }
  }

  return (
    <CCard>
      <Section>Dimensão </Section>
      <CCardBody>
        <span>Preencher dimensão de todos produtos com:</span>
        <CRow>
          <CCol xs="12" md="4" className="mt-3">
            <span>Altura (cm)</span>
            <CCol style={{ padding: 0, display: "flex", alignItems: "flex-end" }}>
              <Input
                id="height-shopee-replication"
                name="height-shopee-replication"
                type="number"
                className="form-control"
                required
                placeholder="Informe a altura"
                onChange={({ target: { value } }) => handleSetDimensionHeight(value)}
                style={{ marginRight: "6px", width: "100%" }}
                invalid={heightInputRef.current?.value !== "" && heightInputRef.current?.value <= 0}
                innerRef={heightInputRef}
              />
            </CCol>
          </CCol>
          <CCol xs="12" md="4" className="mt-3">
            <span>Largura (cm)</span>
            <CCol style={{ padding: 0, display: "flex", alignItems: "flex-end" }}>
              <Input
                id="width-shopee-replication"
                name="width-shopee-replication"
                type="number"
                className="form-control"
                required
                placeholder="Informe a largura"
                onChange={({ target: { value } }) => handleSetDimensionWidth(value)}
                style={{ marginRight: "6px", width: "100%" }}
                invalid={widthInputRef.current?.value !== "" && widthInputRef.current?.value <= 0}
                innerRef={widthInputRef}
              />
            </CCol>
          </CCol>
          <CCol xs="12" md="4" className="mt-3">
            <span>Comprimento (cm)</span>
            <CCol style={{ padding: 0, display: "flex", alignItems: "flex-end" }}>
              <Input
                id="length-shopee-replication"
                name="length-shopee-replication"
                type="number"
                className="form-control"
                required
                placeholder="Informe o comprimento"
                onChange={({ target: { value } }) => handleSetDimensionLength(value)}
                style={{ marginRight: "6px", width: "100%" }}
                invalid={lengthInputRef.current?.value !== "" && lengthInputRef.current?.value <= 0}
                innerRef={lengthInputRef}
              />
            </CCol>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default DimensionSection;
