import React, { useContext, useEffect, useState }    from "react";
import Swal                                          from "sweetalert2";
import { useHistory }                                from "react-router-dom";
import api                                           from "../../../services/api";
import { getToken }                                  from "../../../services/auth";
import { CCard, CCardBody, CCardHeader, CCol, CRow } from "@coreui/react";
import MercadoLivreCard                              from "./MercadoLivreCard";
import ShopeeCard                                    from "./ShopeeCard";
import TotalPriceCard                                from "./TotalPriceCard";
import { PlanSignUpContext }                         from "../PlanSignUpContext";
import LoadingCardData                               from "src/components/LoadingCardData";
import MeuMlCard                                     from "src/views/PlanSignUp/PlansAndModules/MeuMlCard";

const PlansAndModules = () => {
  const {
    setAvailablePlans,
    setAvailableModules,
    setDiscountMultipliers,
    allSelectedAccounts,
    selectedPlan,
    selectedModules,
  } = useContext(PlanSignUpContext);

  const [isLoading, setIsLoading] = useState(true);

  const history = useHistory();

  async function getAllPlansAndModules() {
    const res = await api.get("/subscribe", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res;
  }

  useEffect(() => {
    getAllPlansAndModules()
      .then((res) => {
        const discountMultipliers = res.data.data.account_multiplier;

        const allModules = res.data.data.modules.map((module) => ({
          ...module,
          selected: false,
        }));

        const plans = res.data.data.packages.map((plan) => {
          const modules_ids = allModules
            .filter((module) => plan.modules.split(", ").includes(module.title))
            .map((module) => module.id);

          return {
            id: plan.title.toLowerCase(),
            original_id: plan.id,
            name: plan.title,
            modules: allModules.map((module) => ({
              ...module,
              is_default: modules_ids.includes(module.id),
            })),
            modules_ids: modules_ids,
            price: plan.price,
          };
        });

        setDiscountMultipliers(discountMultipliers);
        setAvailablePlans(plans);
        setAvailableModules(allModules);
        setIsLoading(false);
      })
      .catch((error) => {
        Swal.fire({
          title: "Ops!",
          html: `<p>${
            error.response ? error.response.data.message : error
          }</p>`,
          type: "warning",
          showCloseButton: true,
        }).then(history.push("/home"));
        return error.response || error;
      });
  }, [setAvailableModules, setAvailablePlans, setDiscountMultipliers, history]);

  return (
    <>
      <CCard>
        <CCardHeader className="bg-gradient-dark text-white text-center">
          <h5 className="mb-0">Planos e módulos</h5>
        </CCardHeader>
        <CCardBody>
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <LoadingCardData color="#3c4b64" />
            </div>
          ) : (
            <>
              {!allSelectedAccounts.length > 0 && (
                <h6 className="text-center">
                  Selecione acima pelo menos uma conta para ver as opções
                </h6>
              )}
              <CRow>
                <CCol xl="6" lg="6">
                  {allSelectedAccounts.some(
                    (account) => account.platform === "ML",
                  ) && <MercadoLivreCard />}
                  {allSelectedAccounts.some(
                    (account) => account.platform === "SP",
                  ) && <ShopeeCard />}
                  {allSelectedAccounts.length ? (
                    <MeuMlCard />
                  ) : <></>}
                </CCol>
                <CCol xl="6" lg="6">
                  {allSelectedAccounts.length > 0 &&
                  (selectedModules.length > 0 ||
                    Object.keys(selectedPlan).length !== 0) && (
                    <TotalPriceCard />
                  )}
                </CCol>
              </CRow>
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default PlansAndModules;
