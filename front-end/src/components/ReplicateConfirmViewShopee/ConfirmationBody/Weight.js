import { CCard, CCardBody, CCol } from "@coreui/react";
import Section from "./Section";
import { Input } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { setAdvertWeight } from "src/redux/actions/_replicationActions";
import { useRef } from "react";

const WeightSection = () => {
  const dispatch = useDispatch();
  const selectedAdverts = useSelector(state => state.advertsReplication.selectedAdverts);
  const weightInputRef = useRef();

  function handleSetDimensionLength(value) {
    for (const selectedAdvert of selectedAdverts) {
      const originalAdDimensions = selectedAdvert?.advertData?.seller_package_dimensions ?? {};
      const originalAdHasWeight = !!originalAdDimensions.weight;

      if (originalAdHasWeight) continue;

      dispatch(setAdvertWeight({ id: selectedAdvert.id, weight: Number(value) }));
    }
  }

  return (
    <CCard>
      <Section>Peso (g)</Section>
      <CCardBody>
        <span>Preencher peso de todos produtos com:</span>
        <CCol xs="12" className="mt-3" style={{ padding: 0 }}>
          <span>Peso</span>
          <CCol style={{ padding: 0, display: "flex", alignItems: "flex-end" }}>
            <Input
              id="weight-shopee-replication"
              name="weight-shopee-replication"
              type="number"
              className={`form-control`}
              required
              placeholder="Informe o peso"
              onChange={({ target: { value } }) => handleSetDimensionLength(value)}
              style={{ marginRight: "6px", width: "200px" }}
              invalid={weightInputRef.current?.value !== "" && weightInputRef.current?.value <= 0}
              innerRef={weightInputRef}
            />
          </CCol>
        </CCol>
      </CCardBody>
    </CCard>
  );
};

export default WeightSection;
