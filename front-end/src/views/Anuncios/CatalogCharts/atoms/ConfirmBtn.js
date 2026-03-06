import React, { useContext } from "react";
import Swal from "sweetalert2";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { catalogChartsContext } from "../catalogChartsContext";
import {
  addCatalogChartRow,
  createNewCatalogChart,
  editCatalogChartRow,
  linkChartRowWithAdverts,
} from "../requests";
import ButtonComponent from "src/components/ButtonComponent";

export default function ConfirmBtn() {
  const history = useHistory();
  const {
    isLinkingAdverts,
    customRows,
    selectedRow,
    selectedAccount,
    catalogChartName,
    catalogChartTableData,
  } = useContext(catalogChartsContext);

  async function onClickConfirm() {
    if (isLinkingAdverts) {
      await linkChartRowWithAdverts(0, 1, {
        account_id: selectedAccount[0]?.id,
        chart_id: catalogChartTableData?.id,
        row_id: selectedRow?.id,
        advertisings_id: [history.location.state.id],
      });
      history.push("/anuncios");
    } else {
      const customChart = {
        account_id: selectedAccount[0].id,
        name: catalogChartName ? catalogChartName : catalogChartTableData.names.MLB,
        domain_id: catalogChartTableData.domain_id,
        attributes: catalogChartTableData.attributes,
        rows: catalogChartTableData.rows.map(({ attributes }) => ({
          attributes: attributes.filter(({ id }) => id !== "SIZE"),
        })),
        main_attribute: {
          attributes: [
            {
              site_id: "MLB",
              id: catalogChartTableData.main_attribute_id,
            },
          ],
        },
      };

      const handleResponse = async response => {
        if (response.status === "success") {
          await Swal.fire({
            tile: "Atenção!",
            text: response.message,
            type: response.status,
            showCloseButton: true,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: "Fechar",
          });

          return history.push("/anuncios");
        }
      };

      if (selectedRow?.id) {
        handleResponse(
          await editCatalogChartRow(
            {
              account_id: selectedAccount[0].id,
              attributes: selectedRow.attributes.filter(({ id }) => id !== "SIZE"),
              type: catalogChartTableData.type,
            },
            catalogChartTableData.id,
            selectedRow.id,
          ),
        );
      } else if (customRows.length) {
        await Promise.all(
          customRows.map(async ({ attributes }) => {
            const payload = {
              account_id: selectedAccount[0].id,
              attributes: attributes.filter(({ id }) => id !== "SIZE"),
              type: catalogChartTableData.type,
            };
            const response = await addCatalogChartRow(payload, catalogChartTableData.id);
            toast(response.message, { type: toast.TYPE[response.status.toUpperCase() || "ERROR"] });
          }),
        );
      } else handleResponse(await createNewCatalogChart(customChart));
    }
  }

  return (
    <ButtonComponent
      title={isLinkingAdverts ? "Vincular ao anúncio" : "Salvar"}
      icon="cil-check-alt"
      color="success"
      onClick={onClickConfirm}
      variant=""
    />
  );
}
