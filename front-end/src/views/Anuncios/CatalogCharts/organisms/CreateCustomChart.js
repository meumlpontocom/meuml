import React, { useContext, useMemo } from "react";
import Swal from "sweetalert2";
import { FaPencilAlt, FaPlusCircle, FaTrash } from "react-icons/fa";
import CardHeader from "../atoms/CardHeader";
import { catalogChartsContext } from "../catalogChartsContext";
import withReactContent from "sweetalert2-react-content";
import SelectedChartName from "../atoms/SelectedChartName";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CInput,
  CInputGroup,
  CInputGroupAppend,
  CLabel,
  CRow,
  CSelect,
} from "@coreui/react";

const CreateCustomChart = () => {
  const { catalogCharts } = useContext(catalogChartsContext);
  const chartGuide = useMemo(() => catalogCharts["CREATE"], [catalogCharts]);

  async function handleAddRow() {
    const Reactswal = withReactContent(Swal);
    await Reactswal.fire({
      title: "Formulário",
      html: (
        <div style={{ maxHeight: "450px", overflowY: "auto" }}>
          {chartGuide.map(input => {
            const type = input.values ? "select" : input.units ? "text+select" : "text";
            switch (type) {
              case "select":
                return (
                  <CCol xs="12">
                    <CLabel className="text-left">
                      {input.name}
                      <CSelect>
                        {input.values.map(value => (
                          <option key={value.id} id={value.id} name={value.name} value={value.id}>
                            {value.name}
                          </option>
                        ))}
                      </CSelect>
                    </CLabel>
                  </CCol>
                );

              case "text+select":
                return (
                  <CCol xs="12">
                    <CLabel className="text-left">
                      {input.name}
                      <CInputGroup>
                        <CInput />
                        <CInputGroupAppend>
                          <CSelect>
                            {input.units.map(unit => (
                              <option key={unit.id} id={unit.id} name={unit.name} value={unit.id}>
                                {unit.name}
                              </option>
                            ))}
                          </CSelect>
                        </CInputGroupAppend>
                      </CInputGroup>
                    </CLabel>
                  </CCol>
                );

              default:
                return (
                  <CCol xs="12">
                    <CLabel className="text-left">
                      {input.name}
                      <CInput type="text" />
                    </CLabel>
                  </CCol>
                );
            }
          })}
        </div>
      ),
    });
  }

  return (
    <CCard>
      <CardHeader text="Tabela de medidas" />
      <CCardBody>
        <CRow>
          <CCol xs="12">
            <SelectedChartName />
          </CCol>
          <CCol xs="12">
            <h5>Atributos</h5>
            <table className="table table-sm table-responsive table-secondary">
              <thead>
                <tr>
                  {chartGuide.map(attribute => {
                    return <th key={attribute.id}>{attribute.name}</th>;
                  })}
                </tr>
              </thead>
            </table>
            <h5 className="mt-4">Tabela de medidas</h5>
            <CRow>
              <CCol xs="12" sm="4">
                <CButton color="secondary" onClick={handleAddRow}>
                  <FaPlusCircle />
                  &nbsp;Nova linha
                </CButton>
              </CCol>
              <CCol xs="12" sm="4">
                <CButton color="info">
                  <FaPencilAlt />
                  &nbsp;Editar
                </CButton>
              </CCol>
              <CCol xs="12" sm="4">
                <CButton color="danger">
                  <FaTrash />
                  &nbsp;Apagar
                </CButton>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default CreateCustomChart;
