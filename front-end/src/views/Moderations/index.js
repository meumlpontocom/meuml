import { CCard, CCardBody, CCardFooter, CCardHeader, CCol, CContainer, CLabel, CRow } from "@coreui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "react-js-pagination";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Table from "reactstrap/lib/Table";
import ButtonComponent from "src/components/ButtonComponent";
import SelectAccounts from "src/components/SelectAccounts";
import getWidth from "src/helpers/getWindowWidth";
import {
  saveSelectedAccount,
  saveSelectedFromDate,
  saveSelectedToDate,
} from "src/redux/actions/_moderationActions";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import EditAdvertTip from "./EditAdvertTip";
import FilterByDate from "./FilterByDate";
import Infraction from "./Infraction";
import LoadingContainer from "./LoadingContainer";
import ModerationsByAccount from "./ModerationsByAccount";
import { fetchModerations } from "./requests";
import "./styles.scss";

export default function Moderations({ history }) {
  const dispatch = useDispatch();
  const accountsState = useSelector(({ accounts }) => accounts);
  const [windowWidth, setWindowWidth] = useState(() => getWidth());
  const enableOverflowX = useMemo(() => Number(windowWidth) <= 1050, [windowWidth]);

  const { moderations, loading, selectedAccount, meta, selectedFromDate, selectedToDate } = useSelector(
    state => state.moderations,
  );

  const handleClickFilterBtn = useCallback(
    props => {
      fetchModerations({
        id: props?.id || selectedAccount[0]?.id,
        dispatch,
        history,
        page: 1,
        dateFrom: selectedFromDate,
        dateTo: selectedToDate,
      });
    },
    [dispatch, history, selectedAccount, selectedFromDate, selectedToDate],
  );

  useEffect(() => {
    const accountList = Object.values(accountsState.accounts);
    if (accountList.length && !selectedAccount.length) {
      const selected = accountList.filter(
        account => account.internal_status === 1 && account.platform === "ML",
      )[0];
      if (selected) {
        dispatch(saveSelectedAccount(selected));
        handleClickFilterBtn({ id: selected.id });
      } else {
        const toastId = "#userDoNotHaveValidMlAccountErrorMsg";
        const userDoNotHaveValidMlAccountErrorMsg =
          "Você deve possuir ao menos uma conta do Mercado Livre autenticada para usufruir desta funcionalidade MeuML.com!";
        if (!toast.isActive(toastId)) {
          toast(userDoNotHaveValidMlAccountErrorMsg, {
            type: toast.TYPE.ERROR,
            autoClose: 12 * 1000,
            toastId,
          });
        }
      }
    } else if (!accountsState.isLoading && !Object.keys(accountsState.accounts)) {
      Swal.fire({
        title: "Atenção",
        text: "Certifique-se de adicionar ao menos uma conta do Mercado Livre ao MeuML.",
        type: "info",
        showCloseButton: true,
      });
    }
  }, [accountsState.accounts, accountsState.isLoading, handleClickFilterBtn, selectedAccount, dispatch]);

  useEffect(() => {
    const widthListener = () => setWindowWidth(getWidth());
    window.addEventListener("resize", widthListener);
    return () => window.removeEventListener("resize", widthListener);
  }, []);

  const btnBlock = useMemo(
    () => (windowWidth <= 776 || windowWidth > 1200 ? "btn-block" : ""),
    [windowWidth],
  );

  return (
    <CContainer style={{ minWidth: "450px" }}>
      <PageHeader heading="Moderações" subheading="Mercado Livre" />
      <CRow>
        <CCol xs={12} style={{ paddingLeft: 0 }}>
          <ModerationsByAccount />
        </CCol>
        <CCol>
          <CCard className="border-dark">
            <CCardHeader>
              <CRow>
                <CCol xs="12" md="6" xl="4" className="mt-0 mt-md-3">
                  <CLabel htmlFor="select-account-dropdown">Contas</CLabel>
                  <SelectAccounts
                    multipleSelection={false}
                    placeholder="Selecionar conta"
                    selected={selectedAccount}
                    callback={selected => dispatch(saveSelectedAccount(selected))}
                  />
                </CCol>
                <CCol xs="12" md="4" xl="3" className="mt-2 mt-sm-0 mt-md-3">
                  <FilterByDate
                    labelText="Data inicial"
                    value={selectedFromDate}
                    action={saveSelectedFromDate}
                  />
                </CCol>
                <CCol xs="12" md="4" xl="3" className="mt-2 mt-sm-0 mt-md-3">
                  <FilterByDate labelText="Data final" value={selectedToDate} action={saveSelectedToDate} />
                </CCol>
                <CCol xs={12} sm={6} lg={2}>
                  <div style={{ marginTop: "-2px" }}>
                    <ButtonComponent
                      className={`mt-5 ${btnBlock}`}
                      title="Filtrar"
                      icon="cil-filter"
                      onClick={() => handleClickFilterBtn()}
                      id="filter-button"
                      color="primary"
                    />
                  </div>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <LoadingContainer isLoading={loading || accountsState.isLoading}>
                {moderations?.length ? <EditAdvertTip /> : <></>}
                <Table striped hover responsive={enableOverflowX}>
                  <tbody>
                    {moderations?.length ? (
                      moderations.map(infraction => (
                        <Infraction key={infraction.id} infraction={infraction} />
                      ))
                    ) : (
                      <p className="text-center card-text mt-2">
                        Nenhuma moderação encontrada para anúncios da conta e período selecionados.
                      </p>
                    )}
                  </tbody>
                </Table>
              </LoadingContainer>
            </CCardBody>
            <CCardFooter style={{ minHeight: "80px" }}>
              {meta.total ? (
                <Pagination
                  onChange={page =>
                    fetchModerations({
                      id: selectedAccount[0].id,
                      dispatch,
                      history,
                      page,
                      dateFrom: selectedFromDate,
                      dateTo: selectedToDate,
                    })
                  }
                  itemsCountPerPage={meta.limit}
                  totalItemsCount={meta.total}
                  activePage={meta.page}
                  pageRangeDisplayed={5}
                  innerClass="btn-group"
                  activeLinkClass="text-white"
                  activeClass="btn btn-md btn-info"
                  itemClass="btn btn-md btn-outline-info"
                />
              ) : (
                <></>
              )}
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}
