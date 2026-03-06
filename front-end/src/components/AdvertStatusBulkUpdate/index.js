import React, { useEffect, useState } from "react";
import "./index.css";
import Advert                         from "./Advert";
import { Picky }                      from "react-picky";
import api                            from "../../services/api";
import { Provider }                   from "./context";
import LoadPageHandler                from "../Loading";
import { useSelector }                from "react-redux";
import { getToken }                   from "../../services/auth";
import advertPropertiesAnalyzer       from "./advertPropertiesAnalyzer";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Col,
  Label,
} from "reactstrap";
import Swal                           from "sweetalert2";

export default function AdvertStatusBulkUpdate({history}) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [adsWithSubscription, setAdsWithSubscription] = useState([]);
  const [adsWithoutSubscription, setAdsWithoutSubscription] = useState([]);
  // const adverts = useSelector(state => state.adverts);
  const toggleLoading = () => setLoading(!loading);
  const advertising = useSelector((state) => state.selectedAdverts);
  const advertsUrl = useSelector((state) => state.advertsURL);
  const accounts = useSelector((state) => {
    let accountList = [];
    Object.values(state.accounts.accounts).forEach((item) => {
      if (item.permissions) {
        accountList.push({
          id: item.id,
          permissions: item.permissions,
        });
      }
    });
    return accountList;
  });
  const subscription = new advertPropertiesAnalyzer({
    accounts,
    advertising,
    moduleRequiredByOperation: 6,
  });

  function getAdverts() {
    setAdsWithSubscription(subscription.allowedAds);
    setAdsWithoutSubscription(subscription.blockedAds);
    toggleLoading();
  }

  function preventEmptyAdvertList() {
    const anyValidSubscription = subscription.verification();
    if (anyValidSubscription) getAdverts();
    else history.push("/anuncios");
  }

  async function handleApiResponse({response}) {
    try {
      toggleLoading();
      if (response.data.message || response.message) {
        await Swal.fire({
          title: "Atenção",
          html: `<p>${response.data.message || response.message}</p>`,
          showCloseButton: true,
          type: response.data.status || response.status,
        });
        history.push("/anuncios");
      }
    } catch (error) {
      history.push("/anuncios");
      await Swal.fire({
        title: "Erro",
        html: `<p>${error}</p>`,
        type: "error",
        showCloseButton: true,
      });
    }
  }

  async function fetchApi({confirmed = false}) {
    try {
      toggleLoading();
      const status = selectedStatus.value;
      let advertisings_id = [];
      if (!advertising.allChecked) {
        if (selectedStatus.value === "deleted") {
          const allowedAds = adsWithSubscription.filter(
            (ad) => ad.status === "closed"
          );
          if (!allowedAds.length) {
            return Swal.fire({
              title: "Atenção!",
              html: `<p>Para excluir um anúncio, é necessário primeiro finalizá-lo.</p>
            <p>Nenhum dos anúncios selecionados foram finalizados.</p>`,
              type: "warning",
              showCloseButton: true,
            }).then(() => {
              history.push("/anuncios");
            });
          } else advertisings_id = allowedAds.map((ad) => ad.id);
        } else advertisings_id = adsWithSubscription.map((ad) => ad.id);
      } else {
        if (Object.values(advertising.advertsArray).length) {
          advertisings_id = Object.values(advertising.advertsArray)
            .filter((ad) => !ad.checked)
            .map((advert) => advert.id);
        }
      }

      const formData = new FormData();
      formData.append("advertisings_id", advertisings_id);
      formData.append("status", status);

      const response = await api.post(
        `/advertisings/mass-alter-status?confirmed=${
          confirmed ? 1 : 0
        }&select_all=${subscription.allAdvertsSelected ? 1 : 0}${
          subscription.allAdvertsSelected ? `&${advertsUrl}` : ""
        }`,
        formData,
        {
          headers: {Authorization: `Bearer ${getToken()}`},
        }
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
        }).then((user) => {
          if (user.value) fetchApi({confirmed: true});
          else history.push("/anuncios");
        });
      } else await handleApiResponse({response});
    } catch (error) {
      if (error.response) {
        await handleApiResponse({response: error.response});
        return error.response;
      }
      await handleApiResponse({response: {message: error, status: "error"}});
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
    if (action === "excluir" && adsWithSubscription.length) {
      await Swal.fire({
        title: " Atenção!",
        type: "warning",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Sim, tenho certeza",
        cancelButtonText: "Cancelar",
        html: `
              <p>Você tem certeza que deseja <b>EXCLUIR PERMANENTEMENTE</b> ${adsWithSubscription.length} anúncio(s)?</p>
              <p>Você não poderá reativá-lo(s) depois!</p>
            `,
      }).then((user) => {
        if (user.value) fetchApi({confirmed: false});
      });
    } else if (!adsWithSubscription.length && !advertising.allChecked) {
      await Swal.fire({
        title: " Atenção!",
        type: "warning",
        showCloseButton: true,
        html:
          "<p>Os anúncio selecionados para esta operação não possuem uma assinatura válida.</p>",
      });
    } else await fetchApi({confirmed: false});
  };

  function Footer() {
    return advertising.allChecked || adsWithSubscription.length ? (
      <CardFooter>
        <Button onClick={() => history.goBack()} className="mr-3 btn-danger">
          <i className="cil-x-circle mr-1"/>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={() => handleClick()}
          disabled={selectedStatus === ""}
        >
          <i className="cil-check-circle mr-1"/>
          Atualizar{" "}
          {subscription.allAdvertsSelected
            ? "todos os anúncios"
            : `${adsWithSubscription.length} ${
              adsWithSubscription.length > 1 ? "anúncios" : "anúncio"
            }`}
        </Button>
      </CardFooter>
    ) : (
      <></>
    );
  }

  return (
    <Provider
      value={{
        allAdvertsSelected: subscription.allAdvertsSelected,
        allowedAdvertising: [...adsWithSubscription],
        blockedAdvertising: [...adsWithoutSubscription],
      }}
    >
      <LoadPageHandler
        isLoading={loading}
        render={
          <Col xs={12} sm={12} md={8}>
            <Card>
              <CardHeader>
              <span className="page-title">
                <span>ATUALIZAR STATUS</span>
                <span>
                  {subscription.allAdvertsSelected
                    ? " DE TODOS OS ANÚNCIOS"
                    : ""}
                </span>
              </span>
              </CardHeader>
              <CardBody>
                <Col className="mb-3">
                  <Label htmlFor="select-status-menu" id="select-status-label">
                    Selecione o status a ser definido
                  </Label>
                  <Picky
                    htmlFor="select-status-menu"
                    onChange={(selected) => setSelectedStatus(selected)}
                    value={selectedStatus}
                    options={[
                      {label: "Ativar", value: "active"},
                      {label: "Pausar", value: "paused"},
                      {label: "Finalizar", value: "closed"},
                      {label: "Excluir", value: "deleted"},
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
                      Lembre-se: Você só pode excluir anúncios que já
                      encontram-se finalizados.
                    </small>
                  ) : (
                    <div className="mb-5"/>
                  )}
                </Col>
                <Advert/>
              </CardBody>
              <Footer/>
            </Card>
          </Col>
        }
      />
    </Provider>
  );
}
