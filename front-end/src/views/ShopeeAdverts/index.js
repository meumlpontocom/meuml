/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import Table from "./Table";
import Pagination from "./Pagination";
import FiltersCard from "./FiltersCard";
import Advertising from "./Advertising";
import { Link } from "react-router-dom";
import fetchShopeeAdverts from "./requests";
import LoadPageHandler from "../../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setSelectAllAdverts } from "src/redux/actions/_shopeeActions";
import { CBadge, CButtonGroup, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CRow } from "@coreui/react";
import { DropDown } from "../../components/buttons/ButtonGroup";
import ButtonComponent from "src/components/ButtonComponent";

export default function ShopeeAdverts({ history }) {
  const dispatch = useDispatch();

  const advertising = useSelector(({ shopee }) => Object.values(shopee.advertising.list));

  const { total } = useSelector(({ shopee }) => shopee.advertising.pagination);
  const isLoading = useSelector(({ shopee }) => shopee.advertising.isLoading);
  const { selectAll, selected } = useSelector(({ shopee }) => shopee.advertising);

  const disableReplicationBtn = React.useMemo(() => {
    const selectedAds = Object.values(selected).filter(advert => advert.checked === true);
    if (!selectAll && !selectedAds.length) {
      return true;
    }

    return false;
  }, [selectAll, selected]);

  const selectedInfo = React.useMemo(() => {
    const selectedAds = Object.values(selected).filter(x => x.checked === true);
    if (selectAll) return "Todos anúncios selecionados";
    else if (!selectAll && !selectedAds.length) return "Nenhum anúncio selecionado";
    else {
      return `${selectedAds.length} selecionados de ${total}`;
    }
  }, [selected, selectAll, total]);

  React.useEffect(() => {
    fetchShopeeAdverts({
      dispatch,
      filters: {},
      page: 1,
      selectedAccounts: [],
    });
  }, []);

  function handleSelectAll() {
    dispatch(setSelectAllAdverts(true));
  }

  function handleCleanSelection() {
    dispatch(setSelectAllAdverts(false));
  }

  function handleClickReplicate() {
    history.push("/replicar-anuncios-shopee");
  }

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <>
          <FiltersCard history={history} />
          <CCard>
            <CCardHeader>
              <CRow>
                <CCol xs="12" sm="12" md="5" lg="8" className="mb-3">
                  <CButtonGroup>
                    <ButtonComponent
                      color="primary"
                      onClick={handleSelectAll}
                      icon="cil-check"
                      title="Selecionar todos"
                      variant=""
                    />
                    <ButtonComponent
                      color="dark"
                      onClick={handleCleanSelection}
                      icon="cil-minus"
                      title="Limpar seleção"
                    />
                  </CButtonGroup>
                </CCol>
                <CCol>
                  <CRow style={{ display: "flex", justifyContent: "flex-end" }} className="mr-1">
                    <ButtonComponent
                      title="Replicar selecionados"
                      icon="cil-library-add"
                      onClick={() => handleClickReplicate()}
                      disabled={disableReplicationBtn}
                      color="success"
                      className="mr-3"
                      width="200px"
                    />
                    <DropDown
                      caret={true}
                      color="secondary"
                      title={
                        <span>
                          <i className="cil-layers mr-1" />
                          Alterações em Massa
                        </span>
                      }
                      direction="bottom"
                    >
                      <CCol>
                        <Link
                          className={`dropdown-item ${disableReplicationBtn && "disabled"}`}
                          to="/shopee/subir-preco"
                        >
                          <span className="dropdown-item-text">Subir Preço</span>
                        </Link>
                      </CCol>
                    </DropDown>
                  </CRow>
                </CCol>
                <CCol xs="12">
                  <CBadge className="mt-2" color="success">
                    {selectedInfo}
                  </CBadge>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <Table>
                {advertising.length ? (
                  advertising.map(({ account_id, id, images }, index) => {
                    return (
                      <Advertising accountId={account_id} advertId={id} advertImage={images[0]} key={index} />
                    );
                  })
                ) : (
                  <h3 id="no-adverts-h3" className="text-primary text-left">
                    Nenhum anúncio localizado.
                  </h3>
                )}
              </Table>
            </CCardBody>
            <CCardFooter>
              <Pagination />
            </CCardFooter>
          </CCard>
        </>
      }
    />
  );
}
