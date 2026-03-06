/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CButton,
  CRow,
  CCol,
  CCollapse,
  CTooltip,
  CSwitch,
} from "@coreui/react";
import VacationModes from "./vacationModes";
import { Provider } from "./vacationContext";
import SelectAccounts from "../../components/SelectAccounts";
import "./index.css";
import vacationRequests from "./requests";
import CurrentlyOnVacation from "./CurrentlyOnVacation";
import ButtonComponent from "src/components/ButtonComponent";

const VactionMode = ({ history }) => {
  const pausedStartDateRef = useRef(null);
  const pausedEndDateRef = useRef(null);
  const shippingTermStartDateRef = useRef(null);
  const shippingTermEndDateRef = useRef(null);
  const [accountsOnVacation, setAccountsOnVacation] = useState(() => []);
  const [loading, setLoading] = useState(() => false);
  const [selected, setSelected] = useState(() => 0);
  const [selectedAccounts, setSelectedAccounts] = useState(() => []);
  const [showActiveVacations, setShowActiveVacations] = useState(true);
  const [showSetupVacations, setShowSetupVacations] = useState(false);
  const [showAllVacations, setShowAllVacations] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [pauseAdvertsState, setPauseAdvertsState] = useState(() => ({
    startDate: "",
    endDate: "",
    startTime: "00:00",
    endTime: "00:00",
    pause_full: false,
  }));
  const [shippingTermState, setShippingTermState] = useState(() => ({
    startDate: "",
    endDate: "",
    startTime: "00:00",
    endTime: "00:00",
  }));
  const request = new vacationRequests(setLoading, history);

  const disableButtons = useMemo(() => {
    const match = selectedAccounts.reduce((previous, { name }) => {
      let response = [];
      accountsOnVacation.forEach(({ accounts, has_finished }) => {
        if (accounts.search(name) >= 0 && !has_finished) {
          response.push(name);
        }
      });
      return [...previous, ...response];
    }, []);

    return match.length > 0;
  }, [accountsOnVacation, selectedAccounts]);

  useEffect(() => {
    if (disableButtons) {
      setSelected(0);
    }
  }, [disableButtons]);

  useEffect(() => {
    request.listVacations().then(response => {
      if (response?.data?.length) {
        setAccountsOnVacation(() => response.data);
      } else {
        setShowDescription(true);
        setShowSetupVacations(false);
        setShowActiveVacations(false);
      }
    });
  }, []);

  const scrollBottom = delay =>
    setTimeout(
      function () {
        window.scrollTo(0, document.body.scrollHeight);
      },
      [delay],
    );

  function selectedAccountIsNotEligible() {
    Swal.fire({
      title: "Atenção!",
      text: "Uma ou mais contas selecionadas já estão com o modo férias ativo. Certifique-se de desativar o modo férias vigente ou seleciona outra conta para prosseguir.",
      type: "warning",
      showCloseButton: true,
    }).then(() => {
      setShowActiveVacations(true);
      setShowSetupVacations(false);
    });
  }

  function allPaused() {
    if (!disableButtons) {
      setSelected(previous => (previous === 1 ? 0 : 1));
      scrollBottom(500);
    } else {
      selectedAccountIsNotEligible();
    }
  }

  function allActive() {
    if (!disableButtons) {
      setSelected(previous => (previous === 2 ? 0 : 2));
      scrollBottom(500);
    } else {
      selectedAccountIsNotEligible();
    }
  }

  function activateVacation(start, end) {
    request.activateVacationMode({
      confirmed: 0,
      selectedAccounts: selectedAccounts.map(({ id }) => id),
      vacationType: selected,
      vacationStarts: start,
      vacationEnds: end,
      pause_full: pauseAdvertsState.pause_full,
    });
  }

  function handleSubmit() {
    if (!selectedAccounts.length) {
      Swal.fire({
        title: "Atenção!",
        text: "Você deve selecionar ao menos uma conta para ingressar no modo férias.",
        type: "warning",
        swhoCloseButton: true,
      });
    } else {
      if (selected === 1) {
        activateVacation(
          pauseAdvertsState.startDate
            ? `${pauseAdvertsState.startDate} ${pauseAdvertsState.startTime}`
            : null,
          pauseAdvertsState.endDate ? `${pauseAdvertsState.endDate} ${pauseAdvertsState.endTime}` : null,
        );
      } else if (selected === 2) {
        if (!shippingTermState.endDate || !shippingTermState.endTime) {
          Swal.fire({
            title: "Atenção!",
            text: "Você deve informar a data de término das férias para aplicar este modo.",
            type: "warning",
            swhoCloseButton: true,
          }).then(function () {
            const input = shippingTermEndDateRef.current;
            input.className = `${input.className} is-invalid`;
          });
        } else {
          activateVacation(
            shippingTermState.startDate
              ? `${shippingTermState.startDate} ${shippingTermState.startTime}`
              : null,
            shippingTermState.endDate ? `${shippingTermState.endDate} ${shippingTermState.endTime}` : null,
          );
        }
      } else {
        Swal.fire({
          title: "Atenção!",
          text: "Você deve selecionar uma modo férias válido!",
          type: "error",
          showCloseButton: true,
        });
      }
    }
  }

  function handleToggleShowDescription() {
    setShowDescription(previous => !previous);
  }

  function handleToggleActiveVacations() {
    setShowActiveVacations(previous => !previous);
    setShowSetupVacations(false);
    setShowDescription(false);
  }

  function handleToggleSetupVacations() {
    setShowSetupVacations(previous => !previous);
    setShowActiveVacations(false);
    setShowDescription(false);
  }

  return (
    <Provider
      value={{
        vacationMode: selected,
        selectedAccounts,
        scrollBottom,
        shippingTermStartDateRef,
        shippingTermEndDateRef,
        pausedStartDateRef,
        pausedEndDateRef,
        shippingTermState,
        setShippingTermState,
        pauseAdvertsState,
        setPauseAdvertsState,
        accountsOnVacation,
        history,
        setLoading,
        showAllVacations,
      }}
    >
      <CCard>
        <CCardHeader>
          <CCol xs={12} sm={12} md={6} lg={6}>
            <h3 className="text-primary">Modo Férias</h3>
          </CCol>
          <CRow className="mb-4" style={{ paddingLeft: "15px" }}>
            <CCol xs={12}>
              <p>
                <strong className="text-danger">LEIA COM ATENÇÃO antes de usar a ferramenta!</strong>
                <br />
                Caso sua(s) conta(s) tenha muitos anúncios, pode ser que o sistema não consiga alterar todos
                no mesmo dia, devido a uma limitação do Mercado Livre. O Mercado Livre permite que se faça no
                máximo 10.000 alterações por dia em cada conta. Portanto, se você tem mais de 10 mil anúncios,
                é importante ler essas dicas abaixo:
                <ul>
                  <li>
                    A opção com Prazo de Envio NÃO vai funcionar corretamente caso você tenha mais de 10 mil
                    anúncios! O sistema só vai aplicar até atingir o limite do ML, e o restante dos seus
                    anúncios não será alterado. Portanto, se tiver uma quantidade grande, não use a opção de
                    Prazo de Envio, use a opção de "Todos Pausados";
                  </li>
                  <li>
                    Caso tenha mais de 10 mil anúncios, escolha a opção Todos Pausados. O sistema não vai
                    conseguir pausar todos no mesmo dia, portanto faça isso antecipadamente. O sistema irá
                    tentar pausar 10 mil anúncios por dia, de forma automática. Exemplo: se você tiver 15 mil
                    anúncios, e ativar hoje o Modo Férias, o sistema irá tentar pausar 10 mil hoje; e amanhã
                    irá pausar o restante. Se forem mais de 20 mil, irá levar 3 dias; e assim por diante. Por
                    isso, se tiver mais de 10 mil anúncios, ligue o modo férias 2 dias antes de iniciar suas
                    férias. Se forem mais de 20 mil anúncios, ative o Modo Férias 3 dias antes, e assim por
                    diante.
                  </li>
                  <li>
                    Pode ser que o sistema não consiga pausar 10 mil anúncios em 1 dia, porque 10 mil é o
                    limite total de alterações. Se você já fez outras alterações nos seus anúncios durante o
                    dia, antes de ativar o Modo Férias, essas alterações também vão entrar na conta! Portanto
                    se organize para fazer com pelo menos 1 dia de antecedência além de todas as precauções
                    acima.
                  </li>
                  <li>
                    O Mercado Livre não permite adicionar prazo de envio em anúncios de produtos Usados.
                  </li>
                </ul>
              </p>
            </CCol>
          </CRow>
          <CCol xs={12} sm={12} md={6} lg={6}>
            <label htmlFor="select-account-dropdown">
              {selectedAccounts.length
                ? "Contas que entrarão no modo férias:"
                : "Para começar selecione uma ou mais contas:"}
            </label>
            <SelectAccounts
              platform="ML"
              multipleSelection={true}
              selected={selectedAccounts}
              placeholder="Selecionar conta(s)"
              callback={accounts => setSelectedAccounts(accounts)}
            />
          </CCol>
        </CCardHeader>
        <CCollapse show={selectedAccounts.length}>
          <CCardBody>
            {accountsOnVacation.length ? (
              <CCol xs={12} style={{ paddingRight: 0 }}>
                <h3
                  onClick={handleToggleActiveVacations}
                  className={`pointer ${showActiveVacations ? "text-info" : "text-dark"}`}
                >
                  <span>Férias</span>
                  <CButton color="dark" style={{ float: "right" }}>
                    {!showActiveVacations ? (
                      <i className="cil-arrow-circle-bottom mr-1" />
                    ) : (
                      <i className="cil-arrow-circle-top mr-1" />
                    )}
                    {!showActiveVacations ? "Expandir" : "Recolher"}
                  </CButton>
                </h3>
              </CCol>
            ) : (
              <></>
            )}
            <CCol xs={12} className="mb-4">
              <CCollapse show={showActiveVacations}>
                <CRow>
                  <CCol xs={12}>
                    <div className="d-flex mb-2" style={{ paddingLeft: "18px" }}>
                      <CSwitch
                        onChange={({ target: { checked } }) => setShowAllVacations(checked)}
                        checked={showAllVacations}
                        color="primary"
                        id="show-all-vacations-switch"
                        name="show-all-vacations-switch"
                      />
                      <span className="ml-1">Exibir férias finalizadas</span>
                    </div>
                  </CCol>
                  <CurrentlyOnVacation />
                </CRow>
              </CCollapse>
            </CCol>
            <CRow style={{ paddingLeft: "15px" }}>
              <CCol xs={12} className="mb-3">
                <h3
                  onClick={handleToggleSetupVacations}
                  className={`pointer ${showSetupVacations ? "text-info" : "text-dark"}`}
                >
                  <span>Configurar Modo Férias</span>
                  <CButton color="dark" style={{ float: "right" }}>
                    {!showSetupVacations ? (
                      <i className="cil-arrow-circle-bottom mr-1" />
                    ) : (
                      <i className="cil-arrow-circle-top mr-1" />
                    )}
                    {!showSetupVacations ? "Expandir" : "Recolher"}
                  </CButton>
                </h3>
              </CCol>
              <CCol>
                <CCollapse show={showSetupVacations}>
                  <h5>
                    Escolha um modo de férias
                    <small className="text-muted ml-1">(clique em uma opção para obter detalhes)</small>:
                  </h5>
                  <CTooltip content="Ao retornar das Férias, os anúncios voltam a ficar Ativos (somente os que já estavam ativos antes das Férias).">
                    <CButton
                      id="paused-vacation-btn"
                      name="paused-vacation-btn"
                      color={selected === 1 ? "primary" : "light"}
                      onClick={allPaused}
                      className="mr-2"
                    >
                      <i className="cil-media-pause mr-1" />
                      Todos Pausados
                    </CButton>
                  </CTooltip>
                  <CTooltip content="O sistema irá adicionar prazo de envio nos seus anúncios ativos, e irá atualizar este prazo todos os dias de forma automática, de acordo com a data definida na próxima tela.">
                    <CButton
                      color={selected === 2 ? "primary" : "light"}
                      onClick={allActive}
                      id="active-vacation-btn"
                      name="active-vacation-btn"
                    >
                      <i className="cil-truck mr-1" />
                      Ativos com Prazo de Envio
                    </CButton>
                  </CTooltip>
                </CCollapse>
                <br />
                {!showActiveVacations && !showSetupVacations ? (
                  <small className="text-danger">Clique em uma opção acima para saber mais</small>
                ) : (
                  <></>
                )}
              </CCol>
              <CCol xs={12} className="mt-4">
                <VacationModes selected={selected} />
              </CCol>
            </CRow>
          </CCardBody>
        </CCollapse>
        <CCardFooter style={{ paddingRight: "34px", display: "flex", justifyContent: "flex-end" }}>
          <ButtonComponent
            title="Ativar modo férias"
            icon="cil-check-circle"
            disabled={selected === 0 || !selectedAccounts.length}
            onClick={handleSubmit}
            color="success"
            variant=""
          />
        </CCardFooter>
      </CCard>
    </Provider>
  );
};

export default VactionMode;
