import React, { useEffect } from "react";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import api from "src/services/api";
import { useDispatch, useSelector } from "react-redux";
import { resetShopeeStates } from "src/redux/actions/_shopeeActions";
import { getToken } from "src/services/auth";
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CLabel, CRow } from "@coreui/react";
import createShopeeFilterQuery from "src/helpers/createShopeeFilterQuery";
import SelectAccounts from "../../components/AccountsDropdown";
import { ShopeeRulesWarning } from "./Warnings";
import UpdatePrice from "./UpdatePrice";
import UpdateTitle from "./UpdateTitle";
import CreditsWidgetCard from "./CreditsWidgetCard";
import SelectedInfoWidgetCard from "./SelectedInfoWidgetCard";
import EstimatedCostWidgetCard from "./EstimatedCostWidgetCard";
import styled from "styled-components";

const MainCardsWrapperStyles = styled.div`
  display: flex;
  @media (max-width: 1280px) {
    flex-direction: column;
    .col-xl-5 {
      flex: 1;
      max-width: 100%;
    }
    .col-xl-7 {
      flex: 1;
      max-width: 100%;
    }
  }
`;

const AdvertActionWrapperStyles = styled.div`
  display: flex;
  @media (max-width: 1800px) {
    flex-direction: column;
    .col-xl-7 {
      flex: 1;
      min-width: 100%;
    }
    .col-xl-5 {
      flex: 1;
      min-width: 100%;
    }
  }
`;
const WidgetCardsWrapperStyles = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

function ShopeeReplicateSelf({ history }) {
  const dispatch = useDispatch();
  const [priceConfig, setPriceConfig] = React.useState(() => {});
  const [titleAppendString, setTitleAppendString] = React.useState(() => "");

  useEffect(() => {
    return () => {
      dispatch(resetShopeeStates());
    };
  }, [dispatch]);

  const { selectAll } = useSelector(({ shopee }) => shopee.advertising);
  const filters = useSelector(({ shopee }) => shopee.advertising.filters);
  const selectedAdsIds = useSelector(({ shopee }) => {
    if (shopee.advertising.selectAll === true) {
      const notChecked = Object.values(shopee.advertising.selected).filter(({ checked }) => !checked);

      return notChecked.map(({ id, account_id }) => ({ id, account_id }));
    }

    const selectedAdverts = Object.values(shopee.advertising.selected).filter(
      ({ checked }) => checked === true,
    );

    return selectedAdverts.map(({ id, account_id }) => ({ id, account_id }));
  });
  const selectedLength = useSelector(({ shopee: { advertising } }) => {
    if (advertising.selectAll) {
      const notSelected = Object.values(advertising.selected).filter(ad => ad.checked === false).length;

      return advertising.pagination.total - notSelected;
    } else {
      return Object.values(advertising.selected).filter(advert => advert.checked === true).length;
    }
  });
  const selectedAccountList = useSelector(({ accounts }) => Object.values(accounts.selectedAccounts));
  const selectedDestinyAccountsIds = React.useMemo(
    () => selectedAccountList.map(account => account.value),
    [selectedAccountList],
  );
  const selectedOriginAccountsIds = useSelector(({ shopee: { advertising } }) =>
    advertising.selectedAccounts.map(account => account.value),
  );

  async function replicate({ confirmed = 0 }) {
    try {
      if (
        !priceConfig?.value ||
        priceConfig?.value <= 0 ||
        !priceConfig?.operationType ||
        !priceConfig?.operation
      ) {
        Swal.fire({
          title: "Atenção!",
          type: "warning",
          showCloseButton: true,
          text: `Por favor, altere o preço do(s) anúncio(s) seleciondo(s) para prosseguir com o processo de replicação.`,
        });
      } else {
        const url = `/shopee/advertisings/duplicate/self?confirmed=${confirmed}&${createShopeeFilterQuery({
          ...filters,
          accounts: selectedOriginAccountsIds,
        })}select_all=${selectAll ? 1 : 0}`;
        const payload = {
          data: {
            type: "shopee_duplicate_advertising_list",
            attributes: {
              allow_duplicated_account: 0,
              allow_duplicated_title: 0,
              account_id: selectedDestinyAccountsIds,
              advertisings: selectedAdsIds,
              mass_override: {
                priceActions: {
                  ...priceConfig,
                },
                title: titleAppendString || "",
              },
            },
          },
        };

        if (!payload.data.attributes.mass_override.title) {
          delete payload.data.attributes.mass_override.title;
        }

        const response = await api.post(
          url,
          { ...payload },
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );

        const option = await Swal.fire({
          title: confirmed ? "Sucesso!" : "Atenção",
          text: response.data.message,
          type: confirmed ? "success" : "question",
          showCloseButton: true,
          showConfirmButton: true,
          showCancelButton: !confirmed ? true : false,
          cancelButtonText: "Cancelar",
          confirmButtonText: "Confirmar",
        });

        if (!confirmed && option.value) {
          replicate({ confirmed: 1 });
        } else if (confirmed && option.value) {
          history.push("/historico-replicacoes");
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const saveFormValues = React.useCallback((key, value) => {
    setPriceConfig(currentState => {
      return {
        ...currentState,
        [key]: value,
      };
    });
  }, []);

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader className="bg-gradient-primary text-white">
            <h3>Replicar Anúncios</h3>
          </CCardHeader>
        </CCard>

        <CRow>
          <MainCardsWrapperStyles>
            <CCol xl="5" lg="12">
              <CCard>
                <CCardHeader className="bg-gradient-dark text-white">
                  <h5>Selecione abaixo as contas destino</h5>
                </CCardHeader>
                <CCardBody>
                  <SelectAccounts
                    platform="SP"
                    placeholder="Contas da Shopee . . ."
                    label={<CLabel htmlFor="account-select">Selecionar conta(s)</CLabel>}
                    multiple={true}
                  />
                  <ShopeeRulesWarning />
                </CCardBody>
              </CCard>
            </CCol>

            <CCol xl="7" lg="12">
              <CCard>
                <CCardHeader>
                  <WidgetCardsWrapperStyles>
                    <CreditsWidgetCard />
                    <SelectedInfoWidgetCard history={history} selected={selectedLength} />
                    <EstimatedCostWidgetCard />
                  </WidgetCardsWrapperStyles>
                </CCardHeader>
                <CCardBody>
                  <AdvertActionWrapperStyles>
                    <CCol xl="7">
                      <UpdateTitle setTitleAppendString={setTitleAppendString} />
                    </CCol>
                    <CCol xl="5">
                      <UpdatePrice {...priceConfig} saveForm={saveFormValues} />
                    </CCol>
                  </AdvertActionWrapperStyles>
                </CCardBody>
              </CCard>
            </CCol>
          </MainCardsWrapperStyles>
        </CRow>

        <CCard>
          <CCardFooter>
            <CButton color="secondary" size="lg" onClick={() => history.goBack()}>
              <i className="cil-arrow-left mr-1" />
              Voltar
            </CButton>
            <CButton
              color="primary"
              size="lg"
              style={{ float: "right" }}
              onClick={replicate}
              disabled={!selectedDestinyAccountsIds.length}
            >
              <i className="cil-check mr-1" />
              Replicar Anúncios
            </CButton>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  );
}

ShopeeReplicateSelf.propTypes = {
  history: PropTypes.object,
};

export default ShopeeReplicateSelf;
