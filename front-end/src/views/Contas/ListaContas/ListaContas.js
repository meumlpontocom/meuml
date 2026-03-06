import React, { useEffect }       from "react";
import { useSelector }            from "react-redux";
import AddAccount                 from "./components/AddAccount";
import SyncAllBtn                 from "./components/SyncAllBtn";
import NoAccountAlert             from "./components/NoAccountAlert";
import AccountList                from "./components/AccountList";
import LoadPageHandler            from "src/components/Loading";
import useAddAccountValidation    from "./hooks/useAddAccountValidation";
import { CCol, CContainer, CRow } from "@coreui/react";

export default function Contas() {
  const [validationMessage] = useAddAccountValidation();
  const isLoading           = useSelector(state => state.accounts.isLoading);

  useEffect(() => {
    validationMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <CContainer>
          <CCol xs={12}>
            <CRow className="d-flex flex-row justify-content-between">
              <CCol xs={12} sm={6} className="mb-3">
                <AddAccount />
              </CCol>
              <CCol xs={12} sm={6}>
                <SyncAllBtn />
              </CCol>
            </CRow>
          </CCol>
          <CCol xs={12} className="fade-in mt-5">
            <NoAccountAlert />
            <AccountList />
          </CCol>
        </CContainer>
      }
    />
  );
}
