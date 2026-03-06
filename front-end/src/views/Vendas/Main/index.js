import { CCard, CCardBody, CCardFooter, CCol, CRow } from "@coreui/react";
import React, { useEffect, useState }                from "react";
import { useDispatch, useSelector }                  from "react-redux";
import Collapse                                      from "reactstrap/lib/Collapse";
import LoadPageHandler                               from "../../../components/Loading";
import CollapseController                            from "./CollapseController";
import FilterByAccount                               from "./FilterByAccount";
import FilterByOrderStatus                           from "./FilterByOrderStatus";
import FilterStringInput                             from "./FilterStringInput";
import GetMShopsSales                                from "./GetMShopsSales";
import GoToReadyTagsBtn                              from "./GoToReadyTagsBtn";
import Paginate                                      from "./Pagination";
import { fetchSales }                                from "./requests";
import SalesComplete                                 from "./SalesComplete";
import SalesDefault                                  from "./SalesDefault";
import SalesHeader                                   from "./SalesHeader";
import SelectController                              from "./SelectController";
import SelectedSalesTags                             from "./SelectedSalesTags";
import { saveStatusFilter, cleanSalesState }         from "src/redux/actions/_salesActions";
import SubscriptionWrapper                           from "./SubscriptionWrapper";
import "./index.scss";

const Main = () => {
  const dispatch = useDispatch();
  const [apiResponse, setApiResponse] = useState({});
  const { isCardOpen, sales, loading, selectedAccounts, filterStatusList, mshops } = useSelector(
    state => state.sales,
  );

  useEffect(() => {
    dispatch(
      saveStatusFilter(
        filterStatusList.filter(
          ({ value }) => value === "manufacturing" || value === "label_ready" || value === "recent_orders",
        ),
      ),
    );

    fetchSales({
      shouldFetchMShopsData: mshops,
      dispatch,
      selectedAccounts,
      filterStatus: ["manufacturing", "label_ready", "recent_orders"],
    }).then(response => {
      if (response.status) setApiResponse(response);
      else setApiResponse(null);
    });

    return () => {
      dispatch(cleanSalesState());
    };
  }, []); //eslint-disable-line

  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        <SubscriptionWrapper apiResponse={apiResponse}>
          <CCol sm="12">
            <CCard>
              <CCardBody>
                <h5 className="text-primary">Filtrar por</h5>
                <CRow className="px-3">
                  <FilterByAccount />
                  <FilterByOrderStatus />
                  <FilterStringInput />
                  <GetMShopsSales />
                </CRow>
                <CCardFooter className="border-top pb-0 mt-2 px-0">
                  <CCol>
                    <CRow>
                      <div className=" w-100 d-flex justify-content-center">
                        <SelectController />
                        <GoToReadyTagsBtn />
                        <SelectedSalesTags />
                        <CollapseController />
                      </div>
                    </CRow>
                  </CCol>
                </CCardFooter>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol sm="12">
            {Object.keys(sales)
              .sort((saleA, saleB) => {
                return new Date(sales[saleA].sale.date_closed) - new Date(sales[saleB].sale.date_closed);
              })
              .reverse()
              .map((saleId, index) => {
                return (
                  <div key={index}>
                    <SalesHeader toggleKey={saleId} />
                    <Collapse isOpen={!isCardOpen[saleId]}>
                      <CCard>
                        <CCardBody>
                          <SalesDefault id={saleId} />
                        </CCardBody>
                      </CCard>
                    </Collapse>
                    <Collapse isOpen={isCardOpen[saleId]}>
                      <CCard>
                        <CCardBody>
                          <SalesComplete id={saleId} />
                        </CCardBody>
                      </CCard>
                    </Collapse>
                  </div>
                );
              })}
          </CCol>

          <CCol sm="12">
            <CCardFooter className="d-flex justify-content-end">
              <Paginate />
            </CCardFooter>
          </CCol>
        </SubscriptionWrapper>
      }
    />
  );
};

export default Main;
