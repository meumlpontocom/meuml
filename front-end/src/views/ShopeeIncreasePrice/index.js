import React, { useCallback, useMemo, useState }     from "react";
import { CCard, CCardBody, CCardFooter, CCol, CRow } from "@coreui/react";
import useSelection                                  from "./hooks/useSelection";
import Accounts                                      from "./components/Accounts";
import SelectedInfo                                  from "./components/SelectedInfo";
import CancelBtn                                     from "./components/CancelBtn";
import SubmitBtn                                     from "./components/SubmitBtn";
import PageHeader                                    from "src/components/PageHeader";
import PercentageInput                               from "./components/PercentageInput";

const ShopeeIncreasePrice = () => {
  const [percentage, setPercentage]                  = useState("");
  const { selectedAds, selectAll, list, exceptions } = useSelection();

  const getAdvertAccountName = useCallback(({ id }) => id === Number(Object.values(selectedAds)[0].id), [selectedAds]);

  const isBulkUpdating = useMemo(() => 
    selectAll || Object.keys(selectedAds)?.length > 1
  , [selectAll, selectedAds]);

  const subheading = useMemo(() => {
    if (isBulkUpdating) 
      return "em massa";
    else if (!isBulkUpdating && list?.length) 
      return list.filter(getAdvertAccountName)[0]?.name;
    else 
      return "";
  }, [getAdvertAccountName, isBulkUpdating, list]);

  return (
    <CRow className="d-flex flex-column align-items-center mt-5 mt-xs-0">
      <CCol xs={12} md={10} lg={8}>
        <PageHeader heading="Subir preço" subheading={subheading} />
        <CCard>
          <CCardBody>
            <Accounts />
            <SelectedInfo />
            <br />
            <PercentageInput percentage={percentage} setPercentage={setPercentage} />
          </CCardBody>
          <CCardFooter>
            <CRow className="d-flex justify-content-between">
              <CCol xs="12" sm="6">
                <CancelBtn />
              </CCol>
              <CCol xs="12" sm="6" className="text-right">
                <SubmitBtn percentage={percentage} adverts={selectAll ? exceptions : selectedAds} />
              </CCol>
            </CRow>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  );
}

export default ShopeeIncreasePrice;
