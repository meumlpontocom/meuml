import React, { useEffect, useState } from "react";
import { Picky } from "react-picky";
import LoadPageHandler from "src/components/Loading";
import { useSelector } from "react-redux";
import api from "src/services/api";
import { getToken } from "src/services/auth";
import productProprietiesAnalyzer from "./productProprietiesAnalyzer";
import { CCard, CCardHeader, CCardBody, CCardFooter, CButton, CCol, CLabel } from "@coreui/react";
import Swal from "sweetalert2";

export default function ProductStatusUpdate({ history }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [productsWithSubscription, setProductsWithSubscription] = useState([]);

  const toggleLoading = () => setLoading(!loading);
  const { products, allProductsSelected } = useSelector(state => state.mshops);

  const accounts = useSelector(state => {
    let accountList = [];
    Object.values(state.accounts.accounts).forEach(item => {
      if (item.permissions) {
        accountList.push({
          id: item.id,
          permissions: item.permissions,
        });
      }
    });
    return accountList;
  });
  const subscription = new productProprietiesAnalyzer({
    accounts,
    products,
    allProductsSelected,
    moduleRequiredByOperation: 6,
  });

  function getAdverts() {
    setProductsWithSubscription(subscription.allowedProduct);
    toggleLoading();
  }

  function preventEmptyAdvertList() {
    const anyValidSubscription = subscription.verification();
    if (anyValidSubscription) getAdverts();
    else history.push("/anuncios/mercado-shops");
  }

  async function handleApiResponse({ response }) {
    try {
      toggleLoading();
      if (response.data.message || response.message) {
        await Swal.fire({
          title: "Atenção",
          html: `<p>${response.data.message || response.message}</p>`,
          showCloseButton: true,
          type: response.data.status || response.status,
        });
        history.push("/anuncios/mercado-shops");
      }
    } catch (error) {
      history.push("/anuncios/mercado-shops");
      await Swal.fire({
        title: "Erro",
        html: `<p>${error}</p>`,
        type: "error",
        showCloseButton: true,
      });
    }
  }

  async function fetchApi({ confirmed = 0 }) {
    try {
      toggleLoading();
      const status = selectedStatus.value;
      let product_id = [];
      if (!allProductsSelected) {
        if (selectedStatus.value === "deleted") {
          const allowedProduct = productsWithSubscription.filter(ad => ad.status === "closed");
          if (!allowedProduct.length) {
            return Swal.fire({
              title: "Atenção!",
              html: `<p>Para excluir um anúncio, é necessário primeiro finalizá-lo.</p>
            <p>Nenhum dos anúncios selecionados foram finalizados.</p>`,
              type: "warning",
              showCloseButton: true,
            }).then(() => {
              history.push("/anuncios/mercado-shops");
            });
          } else product_id = allowedProduct.map(ad => ad.external_id);
        } else product_id = productsWithSubscription.map(ad => ad.external_id);
      } else {
        if (Object.values(productsWithSubscription).length) {
          product_id = Object.values(productsWithSubscription)
            .filter(ad => ad.selected)
            .map(product => product.external_id);
        }
      }

      const formData = new FormData();
      formData.append("advertisings_id", product_id);
      formData.append("status", status);

      // const response = await fetchProductStatusMshops({ formData, confirmed});

      const response = await api.post(
        `/mshops/advertisings/mass-alter-status?confirmed=${confirmed}&select_all=${
          allProductsSelected ? 1 : 0
        }`,
        formData,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!confirmed) {
        Swal.fire({
          title: "Atenção",
          type: "info",
          showConfirmButton: true,
          confirmButtonText: "Confirmar",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          html: `<p>${response.data.message}</p>`,
        }).then(user => {
          if (user.value) fetchApi({ confirmed: 1 });
          else history.push("/anuncios/mercado-shops");
        });
      } else await handleApiResponse({ response });
    } catch (error) {
      if (error.response) {
        await handleApiResponse({ response: error.response });
        return error.response;
      }
      await handleApiResponse({ response: { message: error, status: "error" } });
      return error;
    }
  }

  useEffect(() => {
    preventEmptyAdvertList();
  }, []); // eslint-disable-line

  const handleClick = async () => {
    const action =
      selectedStatus.value === "active"
        ? "ativar"
        : selectedStatus.value === "paused"
        ? "pausar"
        : selectedStatus.value === "closed"
        ? "finalizar"
        : "excluir";
    if (action === "excluir" && productsWithSubscription.length) {
      await Swal.fire({
        title: " Atenção!",
        type: "warning",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Sim, tenho certeza",
        cancelButtonText: "Cancelar",
        html: `
              <p>Você tem certeza que deseja <b>EXCLUIR PERMANENTEMENTE</b> ${productsWithSubscription.length} anúncio(s)?</p>
              <p>Você não poderá reativá-lo(s) depois!</p>
            `,
      }).then(user => {
        if (user.value) fetchApi({ confirmed: 0 });
      });
    } else if (!productsWithSubscription.length && !allProductsSelected) {
      await Swal.fire({
        title: " Atenção!",
        type: "warning",
        showCloseButton: true,
        html: "<p>Os anúncio selecionados para esta operação não possuem uma assinatura válida.</p>",
      });
    } else await fetchApi({ confirmed: 0 });
  };

  function Footer() {
    return allProductsSelected || productsWithSubscription.length ? (
      <CCardFooter>
        <CButton onClick={() => history.goBack()} className="mr-3 btn-danger">
          <i className="cil-x-circle mr-1" />
          Cancelar
        </CButton>
        <CButton color="primary" onClick={() => handleClick()} disabled={selectedStatus === ""}>
          <i className="cil-check-circle mr-1" />
          Atualizar{" "}
          {subscription.allProductsSelected
            ? "todos os anúncios"
            : `${productsWithSubscription.length} ${
                productsWithSubscription.length > 1 ? "anúncios" : "anúncio"
              }`}
        </CButton>
      </CCardFooter>
    ) : (
      <></>
    );
  }
  return (
    <>
      <LoadPageHandler
        isLoading={loading}
        render={
          <CCol xs={12} sm={12} md={8}>
            <CCard>
              <CCardHeader>
                <span className="page-title">
                  <span>ATUALIZAR STATUS</span>
                  <span>{subscription.allProductsSelected ? " DE TODOS OS ANÚNCIOS" : ""}</span>
                </span>
              </CCardHeader>
              <CCardBody>
                <CCol className="mb-3">
                  <CLabel htmlFor="select-status-menu" id="select-status-label">
                    Selecione o status a ser definido
                  </CLabel>
                  <Picky
                    htmlFor="select-status-menu"
                    onChange={selected => setSelectedStatus(selected)}
                    value={selectedStatus}
                    options={[
                      { label: "Ativar", value: "active" },
                      { label: "Pausar", value: "paused" },
                      { label: "Finalizar", value: "closed" },
                      { label: "Excluir", value: "deleted" },
                    ]}
                    open={false}
                    multiple={false}
                    labelKey="label"
                    valueKey="value"
                    dropdownHeight={420}
                    includeFilter={false}
                    includeSelectAll={false}
                    placeholder="Selecione o status a ser aplicado"
                  />
                  {selectedStatus.value === "deleted" ? (
                    <small className="animated fadeIn text-danger">
                      Lembre-se: Você só pode excluir anúncios que já encontram-se finalizados.
                    </small>
                  ) : (
                    <div className="mb-5" />
                  )}
                </CCol>
                <div className={`row col-12 justify-content-left mt-2`}>
                  <div>
                    <h5>
                      <span className="badge badge-success">
                        Anúncios selecionados:
                        <span className="badge badge-secondary ml-1">{`${productsWithSubscription.length} ${
                          productsWithSubscription.length > 1 ? "anúncios" : "anúncio"
                        }`}</span>
                      </span>
                    </h5>
                  </div>
                </div>
              </CCardBody>
              <Footer />
            </CCard>
          </CCol>
        }
      />
    </>
  );
}
