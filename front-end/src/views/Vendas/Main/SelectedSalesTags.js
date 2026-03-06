import { CButton, CTooltip } from "@coreui/react";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { postTagsToDownload } from "./requests";

export default function SelectedSalesTags() {
  const [isLoading, setIsLoading] = useState(() => false);
  const { selectAllSales } = useSelector((state) => state.sales);
  const selectedSales = useSelector((state) =>
    // Sale Object's key is already sale ID
    Object.keys(state.sales.selectedSales).filter(
      (sale) => state.sales.selectedSales[sale] === true
    )
  );
  async function handleButtonClick() {
    postTagsToDownload({ setIsLoading, selectedSales });
  }

  const disableDownloadBtn = useMemo(() => {
    return isLoading
      ? true
      : !selectAllSales && !selectedSales.length
      ? true
      : false;
  }, [isLoading, selectAllSales, selectedSales.length]);

  return (
    <CTooltip
      content={
        !selectedSales.length
          ? "Selecione as vendas desejadas antes de prosseguir"
          : `${selectedSales.length} venda(s) selecionada(s)`
      }
    >
      <div className="mr-2">
        <CButton
          onClick={handleButtonClick}
          size="sm"
          color="primary"
          disabled={disableDownloadBtn}
        >
          <i className="cil-barcode mr-1 icon-fix" />
          Gerar etiqueta{selectedSales.length > 1 ? "s" : ""}
        </CButton>
      </div>
    </CTooltip>
  );
}
