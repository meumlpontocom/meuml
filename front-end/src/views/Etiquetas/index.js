import { CButton, CCard, CCardBody, CCardHeader, CRow } from "@coreui/react";
import FileSaver                                        from "file-saver";
import React, { useEffect, useRef, useState }           from "react";
import Table                                            from "react-bootstrap-table-next";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import api                                              from "src/services/api";
import { getToken }                                     from "src/services/auth";

export default function Etiquetas() {
  const downloadLabelBtnRef = useRef(null);
  const [labels, setLabels] = useState(() => []);
  const options = { headers: { Authorization: `Bearer ${getToken()}` } };

  async function getReadySalesLabel() {
    try {
      const convertTimeString = (timeObject) =>
        timeObject.toLocaleDateString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      const url = "/orders/shipment/labels";
      const response = await api.get(url, options);
      setLabels(() =>
        response.data.data.map((label) => ({
          ...label,
          date_created: convertTimeString(
            new Date(String(label.date_created).split("GMT")[0])
          ),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getReadySalesLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const DownloadLabelButton = () => {
    async function downloadLabel() {
      try {
        const url = downloadLabelBtnRef.current.url;
        const fileName = downloadLabelBtnRef.current.name;
        FileSaver.saveAs(`https://${url}`, fileName);
      } catch (error) {
        console.error(error);
      }
    }
    return (
      <CButton
        color="success"
        onClick={downloadLabel}
        innerRef={downloadLabelBtnRef}
      >
        <i className="cil-cloud-download mr-1 icon-fix" />
        Baixar
      </CButton>
    );
  };

  function setClickedRow(row) {
    downloadLabelBtnRef.current.url = row.url;
    downloadLabelBtnRef.current.name = row.name;
  }

  return (
    <CCard>
      <CCardHeader>
        <h2 className="text-primary">Etiquetas prontas</h2>
      </CCardHeader>
      <CCardBody>
        <CRow className="justify-content-center">
          <Table
            columns={[
              { dataField: "id", text: "ID da etiqueta" },
              { dataField: "platform", text: "Plataforma" },
              { dataField: "name", text: "Arquivo" },
              { dataField: "date_created", text: "Criado em" },
              {
                text: "Etiquetas",
                dataField: "",
                formatter: DownloadLabelButton,
                classes: "p-1",
              },
            ]}
            keyField="id"
            data={labels}
            rowEvents={{
              onMouseEnter: (e, row, rowIndex) => {
                setClickedRow(row);
              },
            }}
            hover
            striped
            condensed
            bootstrap4
            noDataIndication="Não há nenhum registro."
          />
        </CRow>
      </CCardBody>
    </CCard>
  );
}
