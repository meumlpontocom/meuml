import React, { useContext, useEffect, useMemo, useState }               from "react";
import { useHistory }                                                    from "react-router-dom";
import { useDispatch }                                                   from "react-redux";
import { requestPayment }                                                from "../../../../redux/actions";
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CSpinner } from "@coreui/react";
import Swal                                                              from "sweetalert2";
import { PlanSignUpContext }                                             from "../../PlanSignUpContext";
import formatMoney                                                       from "../../../../helpers/formatMoney";
import { WarningMessageCredits, WarningMessagePayment }                  from "../../Warnings";
import handleBuy                                                         from "./handleBuy";

const TotalPriceCard = () => {
  const {
    selectedPlan,
    allSelectedAccounts,
    selectedModules,
    discountMultipliers,
  } = useContext(PlanSignUpContext);

  const [totalPriceML, setTotalPriceML] = useState(0);
  const [totalPriceSP, setTotalPriceSP] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberAccountsML, setNumberAccountsML] = useState(0);
  const [numberAccountsSP, setNumberAccountsSP] = useState(0);
  const [discountMultiplierML, setDiscountMultiplierML] = useState(1);
  const [discountMultiplierSP, setDiscountMultiplierSP] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const meuMlTotalPrice = useMemo(() => {
    const meuMlSelectedModules = selectedModules.filter(module => module.platform === "MeuML");
    if (meuMlSelectedModules?.length) {
      return meuMlSelectedModules
        .map(module => module.price)
        .reduce((result, num) => result + num);
    }
    return 0;
  }, [selectedModules]);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    setNumberAccountsML(
      allSelectedAccounts.filter((account) => account.platform === "ML").length,
    );
    setNumberAccountsSP(
      allSelectedAccounts.filter((account) => account.platform === "SP").length,
    );
  }, [allSelectedAccounts]);

  // set discount multipliers
  useEffect(() => {
    if (numberAccountsML > 0) {
      const multiplierIndexML = discountMultipliers
        .map((multiplier) => multiplier.accounts)
        .indexOf(numberAccountsML);
      setDiscountMultiplierML(
        discountMultipliers?.filter(
          ({ accounts }) => accounts === multiplierIndexML,
        )[0]?.mutiplier,
      );
    }
    if (numberAccountsSP > 0) {
      const multiplierIndexSP = discountMultipliers
        .map((multiplier) => multiplier.accounts)
        .indexOf(numberAccountsSP);
      setDiscountMultiplierSP(
        discountMultipliers?.filter(
          ({ accounts }) => accounts === multiplierIndexSP,
        )[0]?.mutiplier,
      );
    }
  }, [numberAccountsML, numberAccountsSP, discountMultipliers]);

  useEffect(() => {
    const planPrice = selectedPlan.price || 0;
    const modulesPricesML = selectedModules
      .filter(({ platform }) => platform === "ML")
      .map((module) => module.price);
    const modulesPricesSP = selectedModules
      .filter(({ platform }) => platform === "SP")
      .map((module) => module.price);

    const fullPriceML = planPrice + modulesPricesML.reduce((sum, item) => (sum += item), 0);
    const fullPriceSP = modulesPricesSP.reduce((sum, item) => (sum += item), 0);

    setTotalPriceML(fullPriceML * discountMultiplierML);
    setTotalPriceSP(fullPriceSP * discountMultiplierSP);
  }, [
    selectedPlan,
    selectedModules,
    numberAccountsML,
    discountMultiplierML,
    discountMultiplierSP,
  ]);

  useEffect(() => {
    setTotalPrice(totalPriceML + totalPriceSP + meuMlTotalPrice);
  }, [totalPriceML, totalPriceSP, meuMlTotalPrice]);

  function handleClick() {
    setIsLoading(true);
    const accounts = allSelectedAccounts.map(({ id }) => id).join(",");

    // check if plan is custom. if it is, set id to null:
    const planID = selectedModules.length > 0 ? null : selectedPlan.original_id;

    // set modules to buy to default plan modules + modules selected by the user
    let defaultPlanModules = selectedPlan.modules_ids;
    if (!defaultPlanModules) {
      defaultPlanModules = [];
    }

    const modulesToBuy = defaultPlanModules
      .concat(selectedModules.map(({ id }) => id))
      .join(",");

    const price = totalPrice.toFixed(2);

    const formData = new FormData();
    formData.append("accounts_id", accounts);
    formData.append("total_price", totalPrice);
    formData.append("package_id", planID);
    formData.append("modules_id", modulesToBuy);

    return handleBuy(formData)
      .then((id) => {
        dispatch(
          requestPayment({
            checkoutId: id,
            total: price,
            orderType: "subscription",
          }),
        );
        history.push("/pagamento");
      })
      .catch((error) => {
        if (error.response) {
          Swal.fire({
            title: "Ops!",
            html: `<p>${error.response.data.message}</p>`,
            type: "warning",
            showCloseButton: true,
          });
          return error.response;
        }
        return error;
      });
  }

  return (
    <>
      {Object.keys(selectedPlan).length !== 0 || totalPrice > 0 ? (
        <CCard className="text-center">
          <CCardHeader className="bg-gradient-dark text-white">
            <h5 className="mb-0">
              Plano selecionado:{" "}
              <span className="text-uppercase text-muted">
                {!selectedPlan.name || selectedModules.length > 0
                  ? "Personalizado"
                  : selectedPlan.name}
              </span>
            </h5>
          </CCardHeader>

          <CCardBody>
            {/*MERCADOLIVRE*/}
            {allSelectedAccounts.some(({ platform }) => platform === "ML") && (
              <div>
                <div className="bg-dark rounded px-3 mb-1 text-white d-flex justify-content-center">
                  <p className="mb-0">Contas Mercado Livre selecionadas:</p>
                  <strong className="ml-2">{numberAccountsML}</strong>
                </div>
                <div className="bg-gradient-secondary rounded px-3 mb-1 text-dark d-flex justify-content-between">
                  <p className="mb-0 d-flex align-items-center">
                    <i className="cil-arrow-circle-right mr-2" />
                    <em>Plano {selectedPlan.name}</em>
                  </p>
                  <span>
                    <em>
                      {selectedPlan.price === 0
                        ? "Incluído (Grátis)"
                        : formatMoney(selectedPlan.price)}
                    </em>
                  </span>
                </div>
                {selectedModules.length > 0 &&
                selectedModules.some(({ platform }) => platform === "ML") && (
                  <div>
                    <div className="bg-gradient-secondary text-dark text-bold rounded px-3 mb-1 d-flex">
                      <p className="mb-0 d-flex align-items-center">
                        <i className="cil-arrow-circle-right mr-2" />
                        <em>Módulos Adicionados:</em>
                      </p>
                    </div>

                    {selectedModules
                      .filter(
                        ({ selected, platform }) =>
                          selected === true && platform === "ML",
                      )
                      .map((module) => (
                        <div
                          key={module.id + "_priceCard"}
                          className="bg-gradient-light rounded px-3 mb-1 text-dark d-flex justify-content-between"
                        >
                          <p className="mb-0">{module.title}</p>
                          <span>
                              {module.price === 0
                                ? "Incluído (Grátis)"
                                : formatMoney(module.price)}
                            </span>
                        </div>
                      ))}
                  </div>
                )}
                <div className="bg-secondary text-dark rounded px-3 mb-1 d-flex justify-content-between">
                  <p className="mb-0">Subtotal</p>
                  <strong>
                    <small className="mr-1">por conta</small>
                    {formatMoney(totalPriceML / numberAccountsML)}
                  </strong>
                </div>
                <div className="bg-gradient-dark rounded px-3 text-white d-flex justify-content-between mb-3">
                  <p className="mb-0">TOTAL</p>
                  <strong>{formatMoney(totalPriceML)}</strong>
                </div>
              </div>
            )}
            {/*END MERCADOLIVRE*/}
            {/*SHOPEE*/}
            {allSelectedAccounts.some(({ platform }) => platform === "SP") && (
              <div>
                <div className="bg-dark rounded px-3 mb-1 text-white d-flex justify-content-center">
                  <p className="mb-0">Contas Shopee selecionadas:</p>
                  <strong className="ml-2">{numberAccountsSP}</strong>
                </div>
                {selectedModules.length > 0 &&
                selectedModules.some(({ platform }) => platform === "SP") && (
                  <div>
                    <div className="bg-gradient-secondary text-dark text-bold rounded px-3 mb-1 d-flex">
                      <p className="mb-0 d-flex align-items-center">
                        <i className="cil-arrow-circle-right mr-2" />
                        <em>Módulos Adicionados:</em>
                      </p>
                    </div>

                    {selectedModules
                      .filter(
                        ({ selected, platform }) =>
                          selected === true && platform === "SP",
                      )
                      .map((module) => (
                        <div
                          key={module.id + "_priceCard"}
                          className="bg-gradient-light rounded px-3 mb-1 text-dark d-flex justify-content-between"
                        >
                          <p className="mb-0">{module.title}</p>
                          <span>
                              {module.price === 0
                                ? "Incluído (Grátis)"
                                : formatMoney(module.price)}
                            </span>
                        </div>
                      ))}

                    <div className="bg-secondary text-dark rounded px-3 mb-1 d-flex justify-content-between">
                      <p className="mb-0">Subtotal</p>
                      <strong>
                        <small className="mr-1">por conta</small>
                        {formatMoney(totalPriceSP / numberAccountsSP)}
                      </strong>
                    </div>

                    <div className="bg-gradient-dark rounded px-3 mb-1 text-white d-flex justify-content-between">
                      <p className="mb-0">TOTAL</p>
                      <strong>{formatMoney(totalPriceSP)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/*END SHOPEE*/}
            {/*MEUML*/}
            {allSelectedAccounts.length && (
              <div>
                {selectedModules.length > 0 &&
                selectedModules.some(({ platform }) => platform === "MeuML") && (
                  <div>
                    <div className="bg-gradient-secondary text-dark text-bold rounded px-3 mb-1 d-flex">
                      <p className="mb-0 d-flex align-items-center">
                        <i className="cil-arrow-circle-right mr-2" />
                        <em>Módulos Adicionados:</em>
                      </p>
                    </div>

                    {selectedModules
                      .filter(
                        ({ selected, platform }) =>
                          selected === true && platform === "MeuML",
                      )
                      .map((module) => (
                        <div
                          key={module.id + "_priceCard"}
                          className="bg-gradient-light rounded px-3 mb-1 text-dark d-flex justify-content-between"
                        >
                          <p className="mb-0">{module.title}</p>
                          <span>
                              {module.price === 0
                                ? "Incluído (Grátis)"
                                : formatMoney(module.price)}
                            </span>
                        </div>
                      ))}

                    <div className="bg-secondary text-dark rounded px-3 mb-1 d-flex justify-content-between">
                      <p className="mb-0">Subtotal</p>
                      <strong>
                        <small className="mr-1">por conta</small>
                        {formatMoney(meuMlTotalPrice / allSelectedAccounts.length)}
                      </strong>
                    </div>

                    <div className="bg-gradient-dark rounded px-3 mb-1 text-white d-flex justify-content-between">
                      <p className="mb-0">TOTAL</p>
                      <strong>{formatMoney(meuMlTotalPrice)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/*MEUML*/}
          </CCardBody>

          <CCardFooter>
            <div className="bg-gradient-light text-dark text-bold rounded px-3 py-1 mb-1 text-center">
              <h5 className="mb-0">Valor total: {formatMoney(totalPrice)}</h5>
            </div>
            <CButton
              className="mt-2 text-uppercase"
              color="primary"
              size="lg"
              disabled={totalPrice < 10}
              onClick={handleClick}
            >
              <div className="d-flex align-items-center">
                <h5 className="mb-0 px-3 py-1">comprar</h5>
                {isLoading && <CSpinner size="sm" />}
              </div>
            </CButton>
            <WarningMessagePayment />
            <WarningMessageCredits />
          </CCardFooter>
        </CCard>
      ) : (
        <></>
      )}
    </>
  );
};

export default TotalPriceCard;
