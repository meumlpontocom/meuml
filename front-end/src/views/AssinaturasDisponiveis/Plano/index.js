import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import PlanContext from "./context";
import PlanoPersonalizado from "./PlanoPersonalizado";
import { MainContainer, TitlePlan } from "./styles";
import { useEffect } from "react";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import LoadPageHandler from "../../../components/Loading";
import { Picky } from "react-picky";
import MySubscriptions from "../MySubscriptions";
import WarningMessage from "./WarningMessage";
import $ from "jquery";

export default function Plano({ history }) {
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState({
    selects: [],
    nameId: [],
    selecteds: [],
  });

  const [plans, setPlans] = useState({
    selected: {},
    planSelect: "",
  });

  useEffect(() => {
    async function getPlans() {
      try {
        setLoading(true);
        const {
          data: { data: accountsId },
        } = await api.get("/accounts", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        let accountsToSelectML = [];
        let accountsToSelectSP = [];
        let accountsToSelect = [];
        let accountsNamesIds = [];

        accountsId.map(item =>
          item.internal_status
            ? item?.platform === "ML"
              ? accountsToSelectML.push(item?.name || item.shop_name)
              : accountsToSelectSP.push(item?.name || item.shop_name)
            : null,
        );
        accountsId.map(item =>
          item.internal_status
            ? accountsNamesIds.push({ id: item?.id, name: item?.name, platform: item?.platform })
            : null,
        );

        accountsId.map(item =>
          item.internal_status ? accountsToSelect.push(item?.name || item.shop_name) : null,
        );
        setAccounts({
          selectsML: [...accountsToSelectML],
          selectsSP: [...accountsToSelectSP],
          selects: [...accountsToSelect],
          nameId: [...accountsNamesIds],
          selecteds: [],
        });
        const {
          data: { data },
        } = await api.get("/subscribe", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const {
          data: { data: credits },
        } = await api.get("/credits/available", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const options = data.packages.reduce((obj, item) => {
          return {
            ...obj,
            [item.title]: {
              ...item,
              modules: item.modules.split(",").map(mod => mod.trim()),
              array: item.modules
                .split(",")
                .map(mod => mod.trim())
                .map(myMod => data.modules.filter(mod => myMod === mod.title))
                .map(item => item[0]),
            },
          };
        }, {});
        setPlans({
          credits: { ...credits },
          ...data,
          ...options,
          selected: data.modules.map(item => ({ ...item, checked: false })),
          planSelect: "Personalizado",
        });
      } catch (error) {
        return error;
      } finally {
        setLoading(false);
      }
    }

    getPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  var countAccountsSP = [];
  var countAccountsML = [];
  var previousCountAccountsSP = 0;
  var previousCountAccountsML = 0;

  function handleFilter(data) {
    var accountsNameId = accounts.nameId;
    var previouslySelectedAccounts = accounts.selecteds;

    accountsNameId.map(item => {
      previouslySelectedAccounts.map(value => {
        if (item.name === value) {
          if (item.platform === "SP") {
            previousCountAccountsSP += 1;
          } else if (item.platform === "ML") {
            previousCountAccountsML += 1;
          }
        }
      });
    });

    accountsNameId.map(item => {
      data.map(value => {
        if (item.name === value) {
          if (item.platform === "SP") {
            countAccountsSP.push(item.name);
          }

          if (item.platform === "ML") {
            countAccountsML.push(item.name);
          }
        }
      });
    });

    setTimeout(() => {
      if (countAccountsML.length < 1 && previousCountAccountsML > 0) {
        $(".ML").css({ display: "none" });
        $("#2").css({ display: "none" });

        if (plans.planSelect === "personalizado") {
          setPlans({
            ...plans,
            selected: plans.selected.map(item =>
              plans.Gratuito.array.find(select => item.id === select.id)
                ? { ...item, checked: false, disabled: false }
                : { ...item, checked: false, disabled: false },
            ),
            planSelect: "personalizado",
          });
        }
      } else if (countAccountsML.length > 0) {
        $(".ML").css({ display: "block" });
        $("#2").css({ display: "block" });
      } else {
        $(".ML").css({ display: "none" });
        $("#2").css({ display: "none" });
      }

      if (countAccountsSP.length < 1 && previousCountAccountsSP > 0) {
        $(".SP").css({ display: "none" });

        if (plans.planSelect === "personalizado") {
          setPlans({
            ...plans,
            selected: plans.selected.map(item =>
              plans.Gratuito.array.find(select => item.id === select.id)
                ? { ...item, checked: false, disabled: false }
                : { ...item, checked: false, disabled: false },
            ),
            planSelect: "personalizado",
          });
        }

        if (plans.planSelect === "Profissional") {
          setPlans({
            ...plans,
            selected: plans.selected.map(item =>
              plans.Profissional.array.find(select => item.id === select.id)
                ? { ...item, checked: true, disabled: true }
                : { ...item, checked: false, disabled: false },
            ),
            planSelect: plans.planSelect,
          });
        }
      } else if (countAccountsSP.length > 0) {
        $(".SP").css({ display: "block" });
      } else {
        $(".SP").css({ display: "none" });
      }
    }, 500);

    setAccounts({ ...accounts, selecteds: data });
  }

  return (
    <PlanContext.Provider value={{ plans, setPlans, history, accounts, loading, setLoading }}>
      {loading ? (
        <LoadPageHandler />
      ) : (
        <>
          <MySubscriptions />
          <Row className="mb-2">
            <Col xs={6}>
              <Picky
                onChange={handleFilter}
                value={accounts?.selecteds}
                options={accounts?.selects}
                open={false}
                multiple={true}
                labelKey="external_name"
                valueKey="id"
                includeFilter={true}
                dropdownHeight={600}
                includeSelectAll={true}
                placeholder="Selecione uma conta para continuar"
                selectAllText="Selecionar Todas"
                filterPlaceholder="Buscar conta"
                allSelectedPlaceholder="Todos (%s)"
                manySelectedPlaceholder="%s selecionadas"
              />
            </Col>
          </Row>
          <div className="text-left mb-3 mt-1" style={{ color: "#9D9D9D" }}>
            <div>
              <span>
                <i className="cil-caret-right mr-1" />
                {"Valor mínimo para pagamento com".toUpperCase()}:
              </span>
              <br />
              <span className="ml-3">
                <i className="cil-credit-card mr-1" />
                Cartão de Crédito: R$10,00
              </span>
              <br />
              <span className="ml-3">
                <i className="cil-featured-playlist mr-1" />
                Boleto: R$20,00
              </span>
              <br />
            </div>
          </div>
          <WarningMessage />
          <div className="animated fadeIn">
            {accounts.selecteds.length > 0 && (
              <>
                <TitlePlan>
                  <Row>
                    <Col>
                      <i className="fa fa-chevron-right mr-2" aria-hidden="true" />
                      <span>Planos</span>
                    </Col>
                  </Row>
                </TitlePlan>
                <div className="mt-3 mb-2" style={{ padding: "0px 15px" }}>
                  <h4 style={{ color: "#5A5A5A" }}>Escolha um dos Planos abaixo e personalize-os:</h4>
                  <span style={{ color: "#9D9D9D" }}>
                    <i className="cil-lightbulb mr-1" />
                    Dica: personalize adicionando os módulos que você precisar!
                  </span>
                </div>
                <MainContainer>
                  <PlanoPersonalizado />
                </MainContainer>{" "}
              </>
            )}
          </div>
        </>
      )}
    </PlanContext.Provider>
  );
}
