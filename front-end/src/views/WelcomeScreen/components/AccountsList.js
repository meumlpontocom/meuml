import React                 from "react";
import { useHistory }        from "react-router-dom";
import AccountInfoItem       from "./AccountInfoItem";
import AccountsWrapperStyles from "./AccountsWrapperStyles";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CListGroup,
  CCardFooter,
  CButton,
  CAlert,
} from "@coreui/react";

const AccountsList = ({ accounts }) => {
  const history = useHistory();
  return (
    <CCard>
      <CCardHeader>
        <h4>Contas adicionadas</h4>
      </CCardHeader>
      <CCardBody>
        {accounts.length > 0 ? (
          <AccountsWrapperStyles>
            <CListGroup accent>
              {accounts.map((account) => (
                <AccountInfoItem
                  key={account.id}
                  accountName={account.name}
                  platform={account.platform}
                  // accounts can have multiple plans
                  accountPlans={account.subscription.split(",")}
                />
              ))}
            </CListGroup>
          </AccountsWrapperStyles>
        ) : (
          <CAlert color="warning" className="mb-0">
            <p className="mb-1">
              <strong>Nenhuma conta adicionada.</strong>
            </p>
            <p className="mb-0">
              Você pode adicionar contas clicando no botão abaixo.
            </p>
          </CAlert>
        )}
      </CCardBody>
      <CCardFooter className="d-flex flex-row-reverse">
        <CButton
          variant="outline"
          color="primary"
          className="text-uppercase font-weight-bold ml-3"
          onClick={() => history.push("/contas")}
        >
          Adicionar conta
        </CButton>
        <CButton
          variant="outline"
          color="dark"
          className="text-uppercase font-weight-bold"
          onClick={() => history.push("/assinaturas/planos")}
        >
          Gerenciar Assinaturas
        </CButton>
      </CCardFooter>
    </CCard>
  );
};

export default AccountsList;
