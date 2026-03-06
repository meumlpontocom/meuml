import React, { useMemo }                          from "react";
import { useDispatch, useSelector }                from "react-redux";
import { CCol, CCard, CCardBody, CSwitch, CLabel } from "@coreui/react";
import { setShouldFetchMShopsData }                from "src/redux/actions/_salesActions";

const GetMShopsSales = () => {
  const dispatch = useDispatch();
  const isChecked = useSelector(state => state.sales.mshops);
  const selectedAccounts = useSelector(state => state.sales.selectedAccounts);

  const shouldRenderComponent = useMemo(
    () =>
      !!selectedAccounts.filter(account => account.external_data.tags?.find(tag => tag === "mshops"))
        .length,
    [selectedAccounts],
  );

  function handleSwitchChange({ target }) {
    dispatch(setShouldFetchMShopsData(target.checked));
  }

  return shouldRenderComponent ? (
    <CCol xs="12" className="mt-3">
      <CCol sm="3" className="padding-0">
        <CCard className="border-warning">
          <CCardBody>
            <CSwitch id="mshops" color="warning" onChange={handleSwitchChange} checked={isChecked} />
            <CLabel htmlFor="mshops" className="ml-2 text-warning">
              <strong>Exibir vendas Mercado Shops</strong>
            </CLabel>
          </CCardBody>
        </CCard>
      </CCol>
    </CCol>
  ) : (
    <></>
  );
};

export default GetMShopsSales;
