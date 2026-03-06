/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector }   from "react-redux";
import { 
  CCardBody, 
  CCard, 
  CCardHeader, 
  CRow, 
  CCol, 
  CInput, 
  CButton, 
  CButtonGroup 
} from "@coreui/react";

import ProductHeader                  from "../organisms/ProductHeader/index";
import ProductTable                   from "../organisms/ProductTable/index";
import ProductFooter                  from "../organisms/ProductFooter/index";
import LoadPageHandler                from "../../../../components/Loading";
import SelectAll                      from "../atoms/ProductButtons/SelectAll";
import SelectAllFromPage              from "../atoms/ProductButtons/SelectAllFromPage";
import MassChangeBtn                  from "../atoms/ProductButtons/MassChangeBtn";

import { getAProductsMshops }         from "../requests";


export default function ListShops({history}) {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const products = useSelector((state) => state.mshops.products);
  const { last_page, limit, page, total } = useSelector((state) => state.mshops.meta);

  const {
    loading,
    meta: { first_page },
  } = useSelector((state) => state.mshops);

  const showingPage = () => {
    const x = Number(limit) * Number(page);
    var ads = Object.keys(products);

    if (ads.length === 0) {
      return 'Nenhum anúncio encontrado.';
    } else if (ads.length < limit) {
      return `Exibindo de 1 a ${total} de ${total} anúncios.`;
    } else if (page === 1) {
      return `Exibindo de 1 a ${limit} de ${total} anúncios.`;
    } else if (page === last_page) {
      return `Exibindo de ${total - limit} a ${total} de ${total} anúncios.`;
    }

    return `Exibindo de ${x - limit} a ${x} de ${total} anúncios.`;
  };

  const _handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      filterAdsByString();
    }
  };

  const filterAdsByString = () => {
    let filters = "";

    filters = `&filter_string=${search.trimStart().trimEnd()}`;

    getAProductsMshops({ dispatch, filters, page: first_page });
  };

  useEffect(() => {
    getAProductsMshops({ dispatch, page: first_page });
  }, []);

  return (
    <CCard>
      <ProductHeader />
      <LoadPageHandler
        isLoading={loading}
        render={
          <>
            <CCardHeader>
              <CRow>
                <CCol
                  xs="12"
                  sm="12"
                  md="12"
                  lg="6"
                  xl="6"
                  className="mb-3"
                  style={{ maxWidth: "480px" }}
                >
                  <CRow>
                    <CCol
                      style={{ maxWidth: "280px" }}
                      sm="10"
                      md="10"
                      lg="10"
                      xs="10"
                    >
                      <CInput
                        type="text"
                        value={search}
                        placeholder="Buscar anúncio"
                        title="Buscar por anúncio(s)"
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => _handleKeyDown(event)}
                      />
                    </CCol>
                    <CCol sm="2" md="2" lg="2" xs="2">
                      <CButton
                        id="search-btn"
                        style={{ width: "120px" }}
                        color="primary"
                        onClick={() => {
                          filterAdsByString();
                        }}
                      >
                        <i className="cil-search mr-1" />
                        Pesquisar
                      </CButton>
                    </CCol>
                  </CRow>
                </CCol>
                <CCol xs="12" sm="12" md="4" lg="3" xl="2">
                  <MassChangeBtn />
                </CCol>
              </CRow>
              {Object.keys(products).length ? (
                <CRow className="mt-2">
                    <CCol
                        style={{
                            padding: "0px 0px 0px 18px",
                            maxWidth: "393px",
                            marginBottom: "14px",
                        }}
                        xs={12}
                        sm={6}
                        md={6}
                        lg={6}
                    >
                    <CButtonGroup>
                        <SelectAllFromPage />
                        <SelectAll />
                    </CButtonGroup>
                  </CCol>
                </CRow>
              ) : (
                <></>
              )}
            <span className="badge badge-success mb-1">
              {showingPage()}
            </span>
            </CCardHeader>
            <CCardBody>
              <ProductTable history={history}/>
            </CCardBody>
            <ProductFooter />
          </>
        }
      />
    </CCard>
  );
}
