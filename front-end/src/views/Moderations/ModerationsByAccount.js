import React from "react";
import LoadingContainer from "./LoadingContainer";
import { useDispatch, useSelector } from "react-redux";
import { saveModerationsByAccount } from "src/redux/actions/_moderationActions";
import { fetchTotalModerationAmount } from "./requests";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";

export default function ModerationsByAccount() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);
  const adsModeratedPerAccount = useSelector(
    (state) => state.moderations.adsModeratedPerAccount
  );

  React.useEffect(() => {
    if (!adsModeratedPerAccount.length) {
      fetchTotalModerationAmount()
        .then((accountList) => {
          if (accountList) dispatch(saveModerationsByAccount(accountList));
        })
        .finally(() => setIsLoading(false));
    }
  }, [adsModeratedPerAccount, dispatch]);

  return (
    <CCol xs={12} md={6} lg={4}>
      <CCard
        className="border-dark"
        style={{ maxWidth: "18rem", minWidth: "330px" }}
      >
        <CCardHeader>Contas do Mercado Livre</CCardHeader>
        <CCardBody className="text-dark">
          <h5 className="card-title">Anúncios moderados por conta:</h5>
          <LoadingContainer isLoading={isLoading}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {adsModeratedPerAccount.map((account) => (
                <li key={account.account_id} className="card-text">
                  <i className="cil-user mr-1" />
                  {account.account_name}:&nbsp;{account.moderated_advertisings}{" "}
                  anúncios
                </li>
              ))}
            </ul>
          </LoadingContainer>
        </CCardBody>
      </CCard>
    </CCol>
  );
}
